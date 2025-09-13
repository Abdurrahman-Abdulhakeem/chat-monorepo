/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  User,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserSearch, SearchUser } from "@/lib/hooks/useUserSearch";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (user: SearchUser) => void;
}

export function NewChatModal({
  isOpen,
  onClose,
  onStartChat,
}: NewChatModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const { results, isLoading, error, searchUsers, clearResults } =
    useUserSearch();

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) return;

    setHasSearched(true);
    await searchUsers(searchQuery);
  };

  const handleStartChat = (user: SearchUser) => {
    onStartChat(user);
    onClose();
    setSearchQuery("");
    clearResults();
    setHasSearched(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setSearchQuery("");
      clearResults();
      setHasSearched(false);
    }

    if (!searchQuery.trim() || searchQuery.length < 2) {
      clearResults();
      setHasSearched(false);
      return;
    }

    setHasSearched(true);

    const delayDebounce = setTimeout(() => {
      searchUsers(searchQuery);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [isOpen, searchQuery]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative w-full max-w-md mx-4 bg-neutral-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold">Peer with new user</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-white/50"
                autoFocus
              />
            </div>

            {/* Search hint */}
            {searchQuery.length > 0 && searchQuery.length < 2 && (
              <p className="text-xs text-white/50 mt-2">
                Please enter at least 2 characters to search
              </p>
            )}
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span className="text-white/60">Searching...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex flex-col items-center justify-center p-8 text-red-400">
                <AlertCircle className="w-8 h-8 mb-2" />
                <span className="text-center">{error}</span>
                <button
                  onClick={handleSearch}
                  className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* No Results */}
            {!isLoading && !error && hasSearched && results.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-white/60">
                <Search className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-medium">No users found</p>
                <p className="text-sm text-center mt-1">
                  Try searching with a different username or email address
                </p>
              </div>
            )}

            {/* Search Results */}
            {!isLoading && !error && results.length > 0 && (
              <div className="p-2">
                <div className="text-xs text-white/50 px-3 pb-2">
                  Found {results.length} user{results.length !== 1 ? "s" : ""}
                </div>
                {results.map((user, index) => (
                  <motion.button
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: index * 0.1 },
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStartChat(user)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all duration-200 group"
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-white/20 transition-all"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center ring-2 ring-transparent group-hover:ring-white/20 transition-all">
                        <User className="w-6 h-6 text-white/60" />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium group-hover:text-white transition-colors">
                        {user.name}
                      </div>
                      <div className="text-sm text-white/60 group-hover:text-white/70 transition-colors">
                        {user.email}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MessageSquare className="w-5 h-5 text-white/40" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Initial State */}
            {!hasSearched && !isLoading && (
              <div className="flex flex-col items-center justify-center p-8 text-white/60">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 opacity-50" />
                </div>
                <p className="font-medium mb-1">
                  Search for peers to start a conversation
                </p>
                <p className="text-sm text-center text-white/50">
                  Enter a username or email address above to find peers
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
