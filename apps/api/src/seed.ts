import mongoose from "mongoose";
import { Conversation, Message } from "./storage";
import { randomUUID } from "crypto";

export async function seed() {
  const userA = new mongoose.Types.ObjectId("68a74807fc49eae67d606dda"); 
  const userB = new mongoose.Types.ObjectId("68a7555dfc49eae67d606dea");

  // Create a conversation
  const conv = await Conversation.create({
    participants: [userA, userB],
    lastMsgAt: new Date(),
  });

  // Insert some messages
  await Message.insertMany([
    {
      convId: conv._id,
      from: userA,
      to: userB,
      kind: "text",
      text: "Hey, how are you?",
      clientId: randomUUID(),
      sentAt: new Date(),
    },
    {
      convId: conv._id,
      from: userB,
      to: userA,
      kind: "text",
      text: "I’m good, thanks! You?",
      clientId: randomUUID(),
      sentAt: new Date(Date.now() + 1000),
    },
    {
      convId: conv._id,
      from: userA,
      to: userB,
      kind: "image",
      media: {
        url: "https://example.com/cat.jpg",
        mime: "image/jpeg",
        w: 800,
        h: 600,
        size: 120345,
      },
      clientId: randomUUID(),
      sentAt: new Date(Date.now() + 2000),
    },
  ]);

  console.log("Conversation and messages inserted!");
}
