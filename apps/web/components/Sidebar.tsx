"use client";

import { LogOut, MessageSquarePlus, Settings, User } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useConversations } from "@/lib/hooks/chat";
import { Conv } from "@/lib/types";
import api from "@/lib/api";
import { NewChatModal } from "./NewchatModal";
import { useAuth } from "@/contexts/AuthProvider";

interface SidebarProps {
  activeConv: Conv | null;
  showChat: boolean;
  showProfile: boolean;
  setActiveConv: (c: Conv) => void;
  setShowChat: (c: boolean) => void;
  setShowProfile: (c: boolean) => void;
  refetchMessages: () => void;
  setActiveView: (s: string) => void;
}

interface SearchUser {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

const Sidebar = ({
  activeConv,
  setActiveConv,
  setShowChat,
  refetchMessages,
  showChat,
  setActiveView,
  showProfile,
  setShowProfile,
}: SidebarProps) => {
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const { data: conversations, refetch: refetchConversations } =
    useConversations();
  const { logout } = useAuth()

  const openConversation = async (conv: Conv) => {
    setActiveConv(conv);
    setShowChat(true);
    refetchMessages();
    setActiveView("chat");
  };

  const handleStartNewChat = async (user: SearchUser) => {
    try {
      // Create or ensure conversation exists
      const response = await api.post("/conv/ensure", {
        peerId: user._id,
      });

      const { convId } = response.data;

      await refetchConversations();
      const newConv: Conv | undefined = conversations?.find(
        (c: Conv) => c._id === convId
      );
      if (newConv) {
        openConversation(newConv);
      }
      setShowNewChatModal(false);
    } catch (error) {
      console.error("Error starting new chat:", error);
    }
  };

  useEffect(() => {
    if (!conversations?.length) return;
    if (activeConv) return;

    // check for large screen
    // if (window.innerWidth >= 768) {
    //   openConversation(conversations[0]);
    // }
  }, [conversations, activeConv]);

  return (
    <>
      <aside
        className={`flex flex-col h-dvh overflow-auto border-r border-white/10 p-4 gap-3 ${
          showChat || showProfile ? "hidden" : "flex"
        } md:flex`}
      >
        <div className="flex sticky z-10 top-0 backdrop-blur items-center justify-between">
          <div className="font-semibold flex-1 text-xl tracking-tighter">
            PeerMe
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors mr-2"
                >
                  <MessageSquarePlus className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New Chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white/5 backdrop-blur border border-white/10 text-white"
            >
              <DropdownMenuItem
                onClick={() => {
                  setTimeout(() => {
                    setShowProfile(true);
                    setActiveView("profile");
                    setShowChat(false);
                  }, 50);
                }}
              >
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-400 focus:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 overflow-y-auto">
          {conversations?.map((c) => (
            <button
              key={c._id}
              onClick={() => openConversation(c)}
              className={`w-full text-left px-3 py-2 rounded-2xl hover:bg-white/10 transition-colors ${
                activeConv?._id === c._id ? "bg-white/10" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {c.peer?.avatarUrl ? (
                  <img
                    src={c.peer.avatarUrl}
                    alt={c.peer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-white/60" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {c.peer?.name || c.peer?._id}
                  </div>
                  <div className="text-xs opacity-70 truncate">
                    {c.peer?.email}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {(!conversations || conversations.length === 0) && (
            <div className="text-center py-8 text-white/60">
              <MessageSquarePlus className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs">Start a new chat to begin messaging</p>
            </div>
          )}
        </div>
      </aside>

      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onStartChat={handleStartNewChat}
      />
    </>
  );
};

export default Sidebar;
