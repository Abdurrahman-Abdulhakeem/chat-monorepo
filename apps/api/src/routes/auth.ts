import { Router } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { User } from "../storage";
import {
  comparePassword,
  hashPassword,
  signAccess,
  signRefresh,
  verifyRefresh,
} from "../auth";

export const auth = Router();

export const RegisterSchema = z.object({
email: z.string().email("Enter a valid email"),
name: z.string().min(2, "Name must be at least 2 characters"),
password: z.string().min(6, "Password must be at least 6 characters")
});


export const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Auth middleware for protected routes
export const authMiddleware = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any;
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

/** Register */
auth.post("/register", async (req, res) => {
  try {
    const body = RegisterSchema.parse(req.body);

    const exists = await User.findOne({ email: body.email });
    if (exists) return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await hashPassword(body.password);

    const user = await User.create({
      email: body.email,
      passwordHash,          
      name: body.name,
    });

    const id = user._id.toString();
    const accessToken = signAccess(id);
    const refreshToken = signRefresh(id);

    return res.status(201).json({
      user: { 
        id, 
        _id: id,
        email: user.email, 
        name: user.name 
      },
      tokens: { 
        access: accessToken, 
        refresh: refreshToken 
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/** Login */
auth.post("/login", async (req, res) => {
  try {
    const body = LoginSchema.parse(req.body);

    const user = await User.findOne({ email: body.email });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await comparePassword(body.password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const id = user._id.toString();
    const accessToken = signAccess(id);
    const refreshToken = signRefresh(id);

    return res.status(200).json({
      user: { 
        id, 
        _id: id,
        email: user.email, 
        name: user.name 
      },
      tokens: { 
        access: accessToken, 
        refresh: refreshToken 
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/** Refresh */
const RefreshBody = z.object({ refreshToken: z.string().min(1) });

auth.post("/refresh", async (req, res) => { 
  try {
    const { refreshToken } = RefreshBody.parse(req.body);
    const payload = verifyRefresh(refreshToken);
    const accessToken = signAccess(payload.sub);
    return res.json({ access: accessToken });
  } catch (err) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

/** Get current user */
auth.get("/me", authMiddleware, async (req: any, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: "User not found" });
    
    return res.json({
      id: user._id.toString(),
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});
