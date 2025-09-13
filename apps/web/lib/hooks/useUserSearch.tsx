import { useState } from "react";
import api from "@/lib/api";

export interface SearchUser {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export const useUserSearch = () => {
  const [results, setResults] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = async (query: string): Promise<SearchUser[]> => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/users/search", {
        params: { q: query.trim() },
      });

      const users = response.data.users || [];
      setResults(users);
      return users;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Search failed";
      setError(errorMsg);
      setResults([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return {
    results,
    isLoading,
    error,
    searchUsers,
    clearResults,
  };
};
