import mongoose, { Schema, model } from "mongoose";

export async function connectMongo(url: string, dbName: string) {
  await mongoose.connect(url, { dbName });
}

// User
const UserSchema = new Schema(
  {
    email: { type: String, unique: true, index: true, required: true },
    name: { type: String },
    avatarUrl: { type: String },
    passwordHash: { type: String, required: true },
    devices: [{ deviceId: String, lastSeenAt: Date, userAgent: String }],
  },
  { timestamps: true }
);

export const User = model("User", UserSchema);

// Conversation
const ConversationSchema = new Schema(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    lastMsgAt: { type: Date, index: true },
  },
  { timestamps: true }
);

// FIX: Create a compound index properly for sorted participants
ConversationSchema.index({ participants: 1 }, { unique: true });

// Add a pre-save hook to ensure participants are always sorted
ConversationSchema.pre('save', function(next) {
  if (this.participants && this.participants.length === 2) {
    this.participants.sort();
  }
  next();
});

export const Conversation = model("Conversation", ConversationSchema);

// Message
const MessageSchema = new Schema(
  {
    convId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      index: true,
      required: true,
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    to: { type: Schema.Types.ObjectId, ref: "User", index: true },
    kind: {
      type: String,
      enum: ["text", "image", "file", "voice"],
      required: true,
    },
    text: { type: String },
    media: {
      url: String,
      mime: String,
      w: Number,
      h: Number,
      size: Number,
    },
    clientId: { type: String, unique: true, sparse: true }, // Add sparse index
    sentAt: { type: Date, index: true, default: Date.now },
    deliveredAt: Date,
    readAt: Date,
  },
  { timestamps: true }
);

MessageSchema.index({ convId: 1, sentAt: -1 }); // Better index for message queries
export const Message = model("Message", MessageSchema);

// Helpers
export async function ensureConversation(
  userId: string,
  peer: { id?: string; email?: string; name?: string }
) {
  let peerUser = null;

  if (peer.id) {
    peerUser = await User.findById(peer.id);
  } else if (peer.email) {
    peerUser = await User.findOne({ email: peer.email });
  } else if (peer.name) {
    peerUser = await User.findOne({ name: peer.name });
  }

  if (!peerUser) throw new Error("Peer not found");

  // FIX: Always sort participant IDs to ensure consistency
  const ids = [userId.toString(), peerUser._id.toString()].sort();
  
  // Check if conversation exists
  let conv = await Conversation.findOne({ 
    participants: { $all: ids, $size: 2 } 
  });

  if (!conv) {
    conv = await Conversation.create({
      participants: ids,
      lastMsgAt: new Date(), 
    });
  }

  return conv;
}