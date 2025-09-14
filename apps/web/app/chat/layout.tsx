"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import Loader from "@/components/Loader";

const ChatLayout = ({ children }: { children: ReactNode }) => {
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      logout();
    }
  }, [user, isLoading, logout]);

  if (isLoading) {
    return <Loader />;
  }

  return <>{children}</>;
};

export default ChatLayout;
