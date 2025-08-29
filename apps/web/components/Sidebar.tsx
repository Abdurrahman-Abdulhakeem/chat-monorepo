/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { LogOut, MessageSquarePlus, Settings, User } from "lucide-react";
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
import { useEffect } from "react";
import { Conv } from "@/lib/types";

interface SidebarProps {
  activeConv: Conv | null;
  showChat: boolean;
  setActiveConv: (c: Conv) => void;
  setShowChat: (c: boolean) => void;
  refetchMessages: () => void;
}

const Sidebar = ({
  activeConv,
  setActiveConv,
  setShowChat,
  refetchMessages,
  showChat,
}: SidebarProps) => {
  const { data: conversations } = useConversations();
  const openConversation = async (conv: Conv) => {
    setActiveConv(conv);
    setShowChat(true);
    refetchMessages();
  };
  useEffect(() => {
    if (!conversations?.length) return;
    if (activeConv) return; // don’t override if user already selected one

    // check for large screen
    if (window.innerWidth >= 768) {
      openConversation(conversations[0]); // auto open the first (most recent)
    }
  }, [conversations, activeConv]);
  return (
    <aside
      className={`flex flex-col border-r border-white/10 p-4 gap-3 ${
        showChat ? "hidden" : "flex"
      } md:flex`}
    >
      <div className="flex sticky top-4 backdrop-blur items-center justify-between supports-[backdrop-filter]:bg-white/60">
        <div className="font-semibold flex-1 text-xl tracking-tighter">
          PeerMe
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <MessageSquarePlus className="w-6 h-6 hover:cursor-pointer opacity-97 mr-10" />
            </TooltipTrigger>
            <TooltipContent>
              <p>New Chat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Settings className="w-6 h-6 hover:cursor-pointer opacity-97" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white/5 backdrop-blur  border border-white/10 text-white">
            <DropdownMenuItem>
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem variant="destructive">
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
            className={`w-full text-left px-3 py-2 rounded-2xl hover:bg-white/10 ${
              activeConv?._id === c._id ? "bg-white/10" : ""
            }`}
          >
            <div className="font-medium">{c.peer?.name || c.peer?._id}</div>
            <div className="text-xs opacity-70">{c.peer?.email}</div>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
