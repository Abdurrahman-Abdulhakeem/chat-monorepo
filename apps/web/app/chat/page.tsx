/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { nanoid } from "nanoid";
import { ArrowLeft, User } from "lucide-react";
import { initSocket } from "@/lib/socket";
import Loader from "@/components/Loader";
import { useMessages, useSendMessage } from "@/lib/hooks/chat";
import { Conv, Msg } from "@/lib/types";
import { Socket } from "socket.io-client";
import Image from "next/image";
import { ChatInput } from "@/components/ChatInput";
import Sidebar from "@/components/Sidebar";
import ProfilePage from "@/components/pages/ProfilePage";
import { useAuth } from "@/contexts/AuthProvider";
import { useDropzone } from "react-dropzone";

export default function ChatPage() {
  const [activeConv, setActiveConv] = useState<Conv | null>(null);
  const [typing, setTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeView, setActiveView] = useState("chat");
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const { refetchUser } = useAuth();

  const meId = useMemo(
    () =>
      typeof window !== "undefined" ? localStorage.getItem("userId") || "" : "",
    []
  );

  const {
    data: messages,
    refetch: refetchMessages,
    isLoading: isMsgLoading,
  } = useMessages(activeConv?._id);
  const sendMessage = useSendMessage(socket);

  useEffect(() => {
    refetchUser();
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

  const handleCloseAll = () => {
    setShowChat(false);
    setShowProfile(false);
  };

  // Image Drop Zone anywhere in chat
  const onDrop = (acceptedFiles: File[]) => {
    setDragging(false);
    const file = acceptedFiles[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setPreviewFile(file);
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    noClick: true, // prevent messing with UI clicks
    onDrop,
    onDragEnter: () => setDragging(true),
    onDragLeave: () => setDragging(false),
  });

  return (
    <>
      <style jsx global>{`
        .ios-smooth-scroll {
          -webkit-overflow-scrolling: touch;
        }
        /* Blur fallback for Safari versions without backdrop-compositing */
        @supports not (backdrop-filter: blur(2px)) {
          .backdrop-fallback {
            background-color: rgba(10, 10, 10, 0.9) !important;
          }
        }
      `}</style>
      <div className="h-screen overflow-x-hidden grid md:grid-cols-[360px_1fr]">
        {/* Sidebar */}
        <Sidebar
          activeConv={activeConv}
          setActiveConv={setActiveConv}
          setShowChat={setShowChat}
          setShowProfile={setShowProfile}
          refetchMessages={refetchMessages}
          showChat={showChat}
          showProfile={showProfile}
          setActiveView={setActiveView}
        />

        {/* Chat */}
        <main className={`relative h-[100dvh] min-h-0`}>
          <AnimatePresence mode="wait">
            {activeView === "profile" ? (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={`h-full ${
                  showProfile ? "flex" : "hidden"
                } md:flex flex-col`}
              >
                <ProfilePage onBack={handleCloseAll} />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className={`h-full ${
                  showChat ? "flex" : "hidden"
                } md:flex flex-col`}
              >
                {/* Sticky header */}
                <div className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/80 supports-[backdrop-filter:blur(2px)]:backdrop-blur backdrop-fallback transform-gpu">
                  <div className="flex items-center gap-3 p-4">
                    <button
                      onClick={handleCloseAll}
                      className="md:hidden p-2 -ml-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    {activeConv?.peer?.avatarUrl ? (
                      <Image
                        width={100}
                        height={100}
                        className="size-10 rounded-2xl"
                        src={activeConv.peer.avatarUrl}
                        alt={activeConv.peer.name!}
                      />
                    ) : (
                      <User className="size-10 rounded-2xl bg-white/10  text-white/60" />
                    )}

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
                </div>

                {isMsgLoading && (
                  <div className="fixed md:left-[160px] z-10 inset-0">
                    <Loader />
                  </div>
                )}
                {/* Scrollable messages (anchored to bottom) */}
                <ul
                  {...getRootProps()}
                  className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col-reverse p-4 gap-3 ios-smooth-scroll will-change-transform"
                >
                  {dragging && (
                    <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50">
                      <p className="text-white text-lg">Drop image to upload</p>
                    </div>
                  )}
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
                          className="max-w-[300px] w-[150px] md:w-[300px] rounded-2xl object-cover shadow"
                        />
                      ) : (
                        <div
                          className={`inline-block max-w-[75%] px-3 py-2 rounded-2xl break-words ${
                            m.from === meId
                              ? "bg-white/85 text-black rounded-br-sm"
                              : "bg-white/10 supports-[backdrop-filter:blur(2px)]:backdrop-blur rounded-bl-sm"
                          }`}
                        >
                          {m.text}
                        </div>
                      )}
                    </motion.li>
                  ))}
                </ul>

                {/* Sticky input wrapper (keeps input in normal flow; not overlay) */}
                <div className="sticky bottom-0 z-20 border-t border-white/10 bg-neutral-950/80 supports-[backdrop-filter:blur(2px)]:backdrop-blur backdrop-fallback transform-gpu">
                  <ChatInput
                    send={send}
                    activeConv={activeConv}
                    socket={socket}
                    preview={preview}
                    previewFile={previewFile}
                    setPreview={setPreview}
                    getInputProps={getInputProps}
                    open={open}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
