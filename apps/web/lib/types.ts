export type UserSafe = {
  _id: string;
  email: string;
  name: string;
  avatarUrl?: string;
};
// Match backend enums exactly
export type MessageKind = "text" | "image" | "file" | "voice";

// Base structure for a message
export type BaseMessage = {
  _id?: string;
  convId: string; // stringified ObjectId
  from: string;
  to?: string;
  kind: MessageKind;
  text?: string;
  media?: {
    url: string;
    mime: string;
    w?: number;
    h?: number;
    size?: number;
  };
  clientId?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Msg = BaseMessage;

// Message you send from client (before _id, timestamps exist)
export type MsgInput = Omit<BaseMessage, "_id" | "deliveredAt" | "readAt" | "createdAt" | "updatedAt">;


export type Peer = { _id: string; name?: string; email?: string; avatarUrl?: string };

export type Conv = { _id: string; peer: Peer | null; lastMsgAt?: string };
