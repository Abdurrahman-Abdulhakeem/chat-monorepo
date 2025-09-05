import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth, User } from "@/contexts/AuthProvider";

export type UpdateProfilePayload = Partial<Omit<User, "id" | "email">>;

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { refetchUser } = useAuth();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const { data } = await api.put("/auth/profile", payload);
      return data.user;
    },
    onSuccess: async (updatedUser) => {
      queryClient.setQueryData(["user"], updatedUser);

      await refetchUser();
    },
  });
}
