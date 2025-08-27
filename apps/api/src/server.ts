import "dotenv/config";
import express from "express";
import http from "http";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { z } from "zod";
import {
  connectMongo,
  Message,
  ensureConversation,
  User,
  Conversation,
} from "./storage.js";
import { auth } from "./routes/auth"; 
import uploadRouter from "./routes/upload";
import mongoose from "mongoose";
import { seed } from "./seed";
import { corsOptions } from "./config/cors";
import { env } from "./config/environment";

const app = express();
app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], 
        imgSrc: ["'self'", "data:", "http://localhost:4000"], // allow images from backend
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));


app.use(cors(corsOptions));
app.use(express.json({ limit: "5mb" }));
app.use(rateLimit({ windowMs: 10_000, limit: 100 }));

// --- simple health route ---
app.get("/health", (_req, res) => res.json({ ok: true }));

// --- auth routes ---
app.use("/auth", auth);


// --- REST endpoints ---
app.get("/conversations", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET!);
    const userId = (payload as any).sub;

    const convs = await Conversation.find({
      participants: userId,
    })
      .sort({ lastMsgAt: -1 })
      .lean();

    const shaped = await Promise.all(
      convs.map(async (c: any) => {
        const peerId = c.participants.find((p: any) => p.toString() !== userId);
        const peer = peerId ? await User.findById(peerId).lean() : null;

        return {
          _id: c._id.toString(),
          peer: peer
            ? {
                _id: peer._id.toString(),
                name: peer.name,
                email: peer.email,
                avatarUrl: peer.avatarUrl,
              }
            : null, // fallback if user not found
          lastMsgAt: c.lastMsgAt,
        };
      })
    );

    res.json({ conversations: shaped });
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
});


const EnsureBody = z.object({
  peerId: z.string().optional(),
  peerName: z.string().optional(),
});

app.post("/conv/ensure", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET!) as any;
    const userId = payload.sub;

    const { peerId, peerName } = EnsureBody.parse(req.body);

    const conv = await ensureConversation(
      userId,
      peerId ? { id: peerId } : { name: peerName }
    );
    return res.json({ convId: conv._id.toString() });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

app.get("/messages/:convId", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    jwt.verify(token, env.JWT_ACCESS_SECRET!);
    const { convId } = req.params;
    const msgs = await Message.find({ convId })
      .sort({ sentAt: -1 })
      .limit(50)
      .lean();
    res.json({ messages: msgs });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.get("/presence/:userId", async (req, res) => {
  try {
    const redisCheck = createClient({ url: env.REDIS_URL });
    await redisCheck.connect();
    const raw = await redisCheck.get(`presence:${req.params.userId}`);
    await redisCheck.disconnect();
    res.json({ online: !!raw });
  } catch {
    res.status(500).json({ error: "Presence error" });
  }
});

app.use("/upload", uploadRouter);
app.use("/uploads", express.static("uploads"));

// --- HTTP + Socket server ---
const server = http.createServer(app);
const io = new Server(server, {
  path: "/rt",
  cors: { origin: env.CORS_ORIGIN },
});

// --- Redis clients & adapter ---
const pub = createClient({ url: env.REDIS_URL });
const sub = pub.duplicate();
await pub.connect();
await sub.connect();
io.adapter(createAdapter(pub, sub));

const PRESENCE_TTL = 12;

// --- socket auth ---
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) throw new Error("no token");
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET!) as any;
    socket.data.userId = payload.sub;
    next();
  } catch {
    next(new Error("unauthorized"));
  }
});

// helper: recompute typing users
async function emitPresenceAndTyping(convId: string) {
  try {
    const conv = await Conversation.findById(convId).lean();
    if (!conv) return;
    const typingUsers: string[] = [];
    for (const u of conv.participants.map((p: any) => p.toString())) {
      const raw = await pub.get(`presence:${u}`);
      if (!raw) continue;
      try {
        const st = JSON.parse(raw);
        if (st.typing) typingUsers.push(u);
      } catch {}
    }
    io.to(convId).emit("presence:typing", { convId, users: typingUsers });
  } catch (err) {
    console.error("emitPresenceAndTyping error", err);
  }
}

io.on("connection", (socket) => {
  const userId = socket.data.userId as string;
  console.log(`socket connected: ${socket.id} (user ${userId})`);
  socket.join(`user:${userId}`);

  socket.on("conv:ensure", async (payload, ack) => {
    try {
      const schema = z.object({ peerId: z.string() }).parse(payload);
      const conv = await ensureConversation(userId, { id: schema.peerId });
      socket.join(conv._id.toString());
      ack?.({ convId: conv._id.toString() });
    } catch (e: any) {
      ack?.({ error: e.message ?? "failed to ensure conv" });
    }
  });

  socket.on("conv:join", async (convId: string, ack?: (res: any) => void) => {
    try {
      const conv = await Conversation.findById(convId).lean();
      if (!conv) return ack?.({ error: "conversation not found" });
      if (!conv.participants.map((p: any) => p.toString()).includes(userId))
        return ack?.({ error: "not a participant" });
      socket.join(convId);
      ack?.({ ok: true });
    } catch (e: any) {
      ack?.({ error: e.message });
    }
  });

  socket.on("history:load", async (payload, ack) => {
    try {
      const schema = z.object({
        convId: z.string(),
        beforeId: z.string().optional(),
        limit: z.number().optional(),
      });
      const p = schema.parse(payload);

      if (!socket.rooms.has(p.convId)) {
        const conv = await Conversation.findById(p.convId).lean();
        if (!conv || !conv.participants.map((p: any) => p.toString()).includes(userId))
          return ack?.({ error: "unauthorized" });
        socket.join(p.convId);
      }

      const q: any = { convId: p.convId };
      if (p.beforeId) q._id = { $lt: p.beforeId };
      const docs = await Message.find(q)
        .sort({ _id: -1 })
        .limit(Math.min(p.limit || 50, 200))
        .lean();
      ack?.({ messages: docs });
    } catch (e: any) {
      ack?.({ error: e.message });
    }
  });

  socket.on("message:send", async (payload, ack) => {
    const MsgSchema = z.object({
      convId: z.string(),
      clientId: z.string().min(8),
      kind: z.enum(["text", "image", "file", "voice"]),
      text: z.string().max(4096).optional(),
      media: z.any().optional(),
    });
    try {
      const m = MsgSchema.parse(payload);
      const conv = await Conversation.findById(m.convId).lean();
      if (!conv) return ack?.({ error: "conversation not found" });
      if (!conv.participants.map((p: any) => p.toString()).includes(userId))
        return ack?.({ error: "not a participant" });

      const doc = await Message.create({
        convId: m.convId,
        from: userId,
        clientId: m.clientId,
        kind: m.kind,
        text: m.text,
        sentAt: new Date(),
        media: m.media,
      });

      await Conversation.findByIdAndUpdate(m.convId, {
        lastMsgAt: new Date(),
      });

      ack?.({
        _id: doc._id.toString(),
        clientId: m.clientId,
        sentAt: doc.sentAt,
      });

      io.to(m.convId).emit("message:new", {
        _id: doc._id.toString(),
        convId: m.convId,
        from: userId,
        kind: m.kind,
        text: m.text,
        sentAt: doc.sentAt,
      });
    } catch (e: any) {
      ack?.({ error: e.message });
    }
  });

  socket.on("presence:ping", async (payload: any) => {
    try {
      const typing = !!payload?.typing;
      const state = {
        convId: payload?.convId || null,
        typing,
        lastSeen: Date.now(),
      };
      await pub.set(`presence:${userId}`, JSON.stringify(state), {
        EX: PRESENCE_TTL,
      });

      if (payload?.convId) {
        await emitPresenceAndTyping(payload.convId);
      }
    } catch (err) {
      console.error("presence:ping error", err);
    }
  });

  socket.on("disconnect", async () => {
    try {
      await pub.del(`presence:${userId}`);
    } catch {}
    console.log(`socket disconnected: ${socket.id} (user ${userId})`);
  });
});

await connectMongo(env.MONGO_URL!, env.MONGO_DB!);
// await seed()
// await Conversation.deleteMany({})
// await Message.deleteMany({})
server.listen(env.PORT || 4000, () =>
  console.log(`api listening on ${env.PORT || 4000}`)
);
