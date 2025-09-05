"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { nanoid } from "nanoid";
import { ArrowLeft } from "lucide-react";
import { initSocket } from "@/lib/socket";
// import Loader from "@/components/Loader";
import { useMessages, useSendMessage } from "@/lib/hooks/chat";
import { Conv, Msg } from "@/lib/types";
import { Socket } from "socket.io-client";
// import Image from "next/image";
import { ChatInput } from "@/components/ChatInput";
import Sidebar from "@/components/Sidebar";

export default function ChatPage() {
  const [activeConv, setActiveConv] = useState<Conv | null>(null);
  const [typing, setTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const meId = useMemo(
    () =>
      typeof window !== "undefined" ? localStorage.getItem("userId") || "" : "",
    []
  );

  const { data: messages, refetch: refetchMessages } = useMessages(
    activeConv?._id
  );
  const sendMessage = useSendMessage(socket);

  useEffect(() => {
    const token = localStorage.getItem("access") || "";
    const s = initSocket(token);
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !activeConv) return;
    socket.emit("conv:join", activeConv._id);

    socket.on("message:new", (msg: Msg) => {
      if (msg.convId === activeConv._id) refetchMessages();
    });

    socket.on(
      "presence:typing",
      ({ convId, users }: { convId: string; users: string[] }) => {
        if (convId === activeConv._id)
          setTyping(users.filter((u) => u !== meId).length > 0);
      }
    );

    return () => {
      socket.off("message:new");
      socket.off("presence:typing");
    };
  }, [socket, activeConv, meId, refetchMessages]);

  const send = async (msg: Partial<Msg>) => {
    if (!activeConv) return;
    const clientId = nanoid();
    await sendMessage.mutateAsync({
      clientId,
      convId: activeConv._id,
      from: meId,
      kind: msg.kind || "text",
      text: msg.text,
      media: msg.media,
    });
    socket?.emit("presence:ping", { convId: activeConv._id, typing: false });
  };

  return (
    <div className="h-screen grid md:grid-cols-[360px_1fr]">
      {/* Sidebar */}
      <Sidebar
        activeConv={activeConv}
        setActiveConv={setActiveConv}
        setShowChat={setShowChat}
        refetchMessages={refetchMessages}
        showChat={showChat}
      />

      {/* Chat */}
      <main
        className={`relative overflow-auto flex flex-col ${
          showChat ? "flex" : "hidden"
        } md:flex`}
      >
        <div className="sticky z-[60] top-0 flex items-center gap-3 p-4 border-b border-white/10 bg-neutral-950/80">
          <button
            onClick={() => setShowChat(false)}
            className="md:hidden p-2 -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="size-10 rounded-2xl bg-white/10" />
          <div>
            <div className="font-medium">
              {activeConv?.peer?.name || "Select a chat"}
            </div>
            <div className="text-xs text-white/60 min-h-4">
              <AnimatePresence>
                {typing && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    typing…
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto flex flex-col-reverse p-4 gap-3">
          {messages?.map((m) => (
            <motion.li
              key={m.clientId ?? m._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                m.from === meId ? "justify-end" : "justify-start"
              }`}
            >
              {m.kind === "image" && m.media?.url ? (
                <img
                  width={100}
                  height={100}
                  src={m.media?.url}
                  alt="shared"
                  className="max-w-[300px] w-[250px] md:w-[300px] rounded-2xl object-cover shadow"
                />
              ) : (
                <div
                  className={`inline-block max-w-[75%] px-3 py-2 rounded-2xl break-words ${
                    m.from === meId
                      ? "bg-white/85 text-black rounded-br-sm"
                      : "bg-white/10 backdrop-blur rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              )}
            </motion.li>
          ))}
        </ul>
        <ChatInput send={send} activeConv={activeConv} socket={socket} />
      </main>
    </div>
  );
}
