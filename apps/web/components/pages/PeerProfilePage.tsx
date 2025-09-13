/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ArrowLeft, Calendar, User } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function PeerProfilePage({
  peer,
  onBack,
}: {
  peer: any;
  onBack: () => void;
}) {
  console.log(peer);
  return (
    <div className="h-screen overflow-auto bg-neutral-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        <div className="flex items-center space-x-4 p-4">
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">{peer.name}&apos;s Profile</h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto p-6 space-y-6"
      >
        {/* Avatar */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
            <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden">
              {peer.avatarUrl ? (
                <Image
                  src={peer.avatarUrl}
                  alt={peer.name}
                  className="w-full h-full object-cover"
                  width={128}
                  height={128}
                />
              ) : (
                <User className="w-16 h-16 text-white/60" />
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                peer.status === "online"
                  ? "bg-green-500 animate-pulse"
                  : peer.status === "offline"
                  ? "bg-yellow-500"
                  : peer.status === "busy"
                  ? "bg-red-500"
                  : "bg-gray-500"
              }`}
            ></div>
            <span className="text-sm text-white/60 capitalize">
              {peer.status || "offline"}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-white/60">Full Name</p>
            <p className="px-4 py-3 rounded-xl bg-white/5">{peer.name}</p>
          </div>

          <div>
            <p className="text-sm text-white/60">Email</p>
            <p className="px-4 py-3 rounded-xl bg-white/5">
              {peer.email || "Not available"}
            </p>
          </div>

          {peer.bio && (
            <div>
              <p className="text-sm text-white/60">Bio</p>
              <p className="px-4 py-3 rounded-xl bg-white/5">{peer.bio}</p>
            </div>
          )}
          {/* Join Date */}
          <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5">
            <Calendar className="w-5 h-5 text-white/60" />
            <div>
              <span className="text-white/60 text-sm">Joined </span>
              <span className="text-white">
                {new Date(peer.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
