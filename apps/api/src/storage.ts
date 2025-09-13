import mongoose, { Schema, model, Document, Types } from "mongoose";

export async function connectMongo(url: string, dbName: string) {
  await mongoose.connect(url, { dbName });
}

// User

export interface Device {
  deviceId: string;
  refreshToken: string;
  userAgent: string;
  ip?: string;
  deviceType: "mobile" | "tablet" | "desktop" | string;
  browser?: string;
  os?: string;
  lastSeenAt: Date;
}

const DeviceSchema = new Schema<Device>({
  deviceId: { 
    type: String, 
    required: true 
  },
  refreshToken: { 
    type: String,
    default: "",
  },
  userAgent: { 
    type: String, 
    required: true 
  },
  ip: { 
    type: String 
  },
  deviceType: { 
    type: String, 
    enum: ['mobile', 'tablet', 'desktop'],
    default: 'desktop'
  },
  browser: { 
    type: String 
  },
  os: { 
    type: String 
  },
  lastSeenAt: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: false });


// User interface for TS
export interface IUser extends Document {
  id?: string; // for toJSON transform
  email: string;
  name: string;
  avatarUrl?: string | null;
  phone?: string | null;
  bio?: string | null;
  location?: string | null;
  passwordHash: string;
  devices: Device[];
  dateOfBirth?: Date | null;
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
  timezone?: string | null;
  language?: string;
  settings?: any;
  status: "online" | "offline" | "away" | "busy";
  lastActiveAt: Date;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isTwoFactorEnabled: boolean;
  failedLoginAttempts: number;
  accountLockedUntil?: Date | null;

  // methods
  cleanupDevices(): void;
  updateActivity(deviceId: string): void;
}

// Add Document with ObjectId and timestamps
type IUserDocument = IUser & Document<Types.ObjectId> & {
  createdAt: Date;
  updatedAt: Date;
};

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      unique: true,
      index: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: null },
    phone: { type: String, default: null, trim: true },
    bio: { type: String, maxlength: 500, default: null, trim: true },
    location: { type: String, default: null, trim: true },
    passwordHash: { type: String, required: true },
    devices: [DeviceSchema],
    dateOfBirth: { type: Date, default: null },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: null,
    },
    timezone: { type: String, default: null },
    language: { type: String, default: "en" },
    settings: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      privacy: {
        profileVisibility: {
          type: String,
          enum: ["public", "friends", "private"],
          default: "public",
        },
        showEmail: { type: Boolean, default: false },
        showPhone: { type: Boolean, default: false },
        showLocation: { type: Boolean, default: true },
      },
      theme: {
        mode: {
          type: String,
          enum: ["light", "dark", "auto"],
          default: "dark",
        },
      },
    },
    status: {
      type: String,
      enum: ["online", "offline", "away", "busy"],
      default: "online",
    },
    lastActiveAt: { type: Date, default: Date.now },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isTwoFactorEnabled: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    accountLockedUntil: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        // TS fix: cast ret to any so we can safely delete
        const obj: any = ret;
        obj.id = obj._id;
        delete obj._id;
        delete obj.__v;
        delete obj.passwordHash;
        return obj;
      },
    },
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ "devices.deviceId": 1 });
UserSchema.index({ lastActiveAt: -1 });

// Virtual
UserSchema.virtual("displayName").get(function (this: IUser) {
  return this.name;
});

// Methods
UserSchema.methods.cleanupDevices = function () {
  if (this.devices.length > 10) {
    this.devices.sort((a: any, b: any) => b.lastSeenAt - a.lastSeenAt);
    this.devices = this.devices.slice(0, 10);
  }
};

UserSchema.methods.updateActivity = function (deviceId: string) {
  this.lastActiveAt = new Date();
  this.status = "online";

  const device = this.devices.find((d: any) => d.deviceId === deviceId);
  if (device) {
    device.lastSeenAt = new Date();
  }
};

export const User = model<IUserDocument>("User", UserSchema);
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
ConversationSchema.index({ participants: 1 });

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
  let peerUser: any = null;

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