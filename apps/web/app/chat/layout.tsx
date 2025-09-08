"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import Loader from "@/components/Loader";

const ChatLayout = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      setRedirecting(true);
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  // Show loader while fetching user OR redirecting
  if (isLoading || redirecting) {
    return <Loader />;
  }

  return <>{children}</>;
};

export default ChatLayout;
