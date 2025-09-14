/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Camera,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MapPinIcon,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Loader from "@/components/Loader";
import { useState } from "react";
import { PreviewImage } from "@/components/ui/PreviewImage";

function ProfileSection({
  user,
  editedUser,
  setEditedUser,
  isEditing,
  fileInputRef,
  handleAvatarChange,
  detectLocation,
  isDetectingLocation,
  isUploadAvatarLoading,
}: any) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
            <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden relative">
              {(isEditing ? editedUser.avatarUrl : user.avatarUrl) ? (
                <>
                  <Image
                    src={isEditing ? editedUser.avatarUrl : user.avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    width={100}
                    height={100}
                    onClick={() =>
                      setSelectedImage(
                        isEditing ? editedUser.avatarUrl : user.avatarUrl
                      )
                    }
                  />
                  {isUploadAvatarLoading && (
                    <div className="absolute flex items-center justify-center transition bg-black/40 backdrop-blur-xs h-full w-full">
                      <Loader size={23} />
                    </div>
                  )}
                </>
              ) : (
                <User className="w-16 h-16 text-white/60" />
              )}
            </div>
          </div>
          {isEditing && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 w-10 h-10 bg-blue-700/70 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
            >
              <Camera className="w-5 h-5 text-white" />
            </motion.button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />

        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              user.status === "online"
                ? "bg-green-500 animate-pulse"
                : user.status === "offline"
                ? "bg-yellow-500"
                : user.status === "busy"
                ? "bg-red-500"
                : "bg-gray-500"
            }`}
          ></div>
          <span className="text-sm text-white/60 capitalize">
            {user.status}
          </span>
        </div>
      </div>

      {/* Profile Fields */}
      <div className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-sm text-white/60">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              value={editedUser.name}
              onChange={(e) =>
                setEditedUser({ ...editedUser, name: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
          ) : (
            <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5">
              <User className="w-5 h-5 text-white/60" />
              <span className="text-white">{user.name}</span>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm text-white/60">Email</label>
          <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5">
            <Mail className="w-5 h-5 text-white/60" />
            <span className="text-white">{user.email}</span>
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-sm text-white/60">Phone</label>
          {isEditing ? (
            <input
              type="tel"
              value={editedUser.phone || ""}
              onChange={(e) =>
                setEditedUser({ ...editedUser, phone: e.target.value })
              }
              placeholder="Enter phone number"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
          ) : (
            <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5">
              <Phone className="w-5 h-5 text-white/60" />
              <span className="text-white">
                {user.phone || "No phone number"}
              </span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm text-white/60">Location</label>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={editedUser.location || ""}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, location: e.target.value })
                  }
                  placeholder="Enter location"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                />
                <button
                  onClick={detectLocation}
                  disabled={isDetectingLocation}
                  className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl border border-blue-500/30 text-blue-400 transition-colors flex items-center space-x-2"
                >
                  {isDetectingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPinIcon className="w-4 h-4" />
                  )}
                  <span className="text-sm">Detect</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5">
              <MapPin className="w-5 h-5 text-white/60" />
              <span className="text-white">
                {user.location || "No location set"}
              </span>
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-sm text-white/60">Bio</label>
          {isEditing ? (
            <textarea
              value={editedUser.bio || ""}
              onChange={(e) =>
                setEditedUser({ ...editedUser, bio: e.target.value })
              }
              rows={3}
              placeholder="Tell us about yourself..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all resize-none"
            />
          ) : (
            <div className="px-4 py-3 rounded-xl bg-white/5">
              <span className="text-white">{user.bio || "No bio added"}</span>
            </div>
          )}
        </div>

        {/* Join Date */}
        <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5">
          <Calendar className="w-5 h-5 text-white/60" />
          <div>
            <span className="text-white/60 text-sm">Joined </span>
            <span className="text-white">
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <PreviewImage
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </div>
  );
}

export default ProfileSection;
