/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Msg, Conv } from "@/lib/types";
import { Socket } from "socket.io-client";

// ---------------------------
// Conversations
// ---------------------------
export const useConversations = () =>
  useQuery<Conv[], Error>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await api.get("/conversations");
      return res.data.conversations as Conv[];
    },
  });

// ---------------------------
// Ensure conversation
// ---------------------------
export const useEnsureConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<{ convId: string }, Error, string>({
    mutationFn: async (peerId: string) => {
      const res = await api.post("/conv/ensure", { peerId });
      return res.data as { convId: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

// ---------------------------
// Messages
// ---------------------------
export const useMessages = (convId?: string) =>
  useQuery<Msg[], Error>({
    queryKey: ["messages", convId],
    queryFn: async () => {
      if (!convId) return [];
      const res = await api.get(`/messages/${convId}?limit=50`);
      return res.data.messages as Msg[];
    },
    enabled: !!convId,
    refetchInterval: false, // Prevent auto refetch, use socket for updates
  });

// ---------------------------
// Send message mutation
// ---------------------------
export const useSendMessage = (socket: Socket | null) => {
  const queryClient = useQueryClient();

  return useMutation<Msg, Error, Msg, { previous?: Msg[] }>({
    mutationFn: async (msg: Msg) => {
      if (!socket || !socket.connected) {
        throw new Error("Socket not initialized or not connected");
      }

      return new Promise<Msg>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Message send timeout"));
        }, 10000); // 10 second timeout

        socket.emit("message:send", msg, (ack: any) => {
          clearTimeout(timeout);
          if (ack?.error) {
            reject(new Error(ack.error));
          } else {
            resolve({
              ...msg,
              _id: ack._id,
              sentAt: ack.sentAt,
            });
          }
        });
      });
    },
    onMutate: async (msg: Msg) => {
      const key = ["messages", msg.convId];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Msg[]>(key);

      // Add optimistic update
      queryClient.setQueryData<Msg[]>(key, (old) => {
        if (!old) return [msg];
        return [msg, ...old];
      });

      return { previous };
    },
    onError: (err, msg, context) => {
      // Rollback on error
      if (context?.previous !== undefined) {
        queryClient.setQueryData(["messages", msg.convId], context.previous);
      }
    },
    onSuccess: (data, variables) => {
      // Update the message with server data
      const key = ["messages", variables.convId];
      queryClient.setQueryData<Msg[]>(key, (old) => {
        if (!old) return [data];
        // Replace the optimistic message with the real one
        return old.map((m) =>
          m.clientId === variables.clientId
            ? { ...m, _id: data._id, sentAt: data.sentAt } // merge instead of replace
            : m
        );
      });
    },
    onSettled: (data, error, msg) => {
      // Ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ["messages", msg.convId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
