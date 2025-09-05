/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Edit3,
  Check,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Bell,
  Palette,
  Globe,
} from "lucide-react";

// Mock user data 
const mockUser = {
  id: "1",
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  phone: "+234 222 123 4567",
  location: "Lagos, NIG",
  joinDate: "January 2025",
  avatar: null,
  bio: "Passionate about technology and connecting with people around the world.",
  status: "online",
};

// Profile Section 
function ProfileSection({
  user,
  editedUser,
  setEditedUser,
  isEditing,
  fileInputRef,
  handleAvatarChange,
}: any) {
  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
            <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden">
              {(isEditing ? editedUser.avatar : user.avatar) ? (
                <img
                  src={isEditing ? editedUser.avatar : user.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
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
              className="absolute bottom-2 right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
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
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-white/60 capitalize">{user.status}</span>
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
          {isEditing ? (
            <input
              type="email"
              value={editedUser.email}
              onChange={(e) =>
                setEditedUser({ ...editedUser, email: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
          ) : (
            <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5">
              <Mail className="w-5 h-5 text-white/60" />
              <span className="text-white">{user.email}</span>
            </div>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-sm text-white/60">Phone</label>
          {isEditing ? (
            <input
              type="tel"
              value={editedUser.phone}
              onChange={(e) =>
                setEditedUser({ ...editedUser, phone: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
          ) : (
            <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5">
              <Phone className="w-5 h-5 text-white/60" />
              <span className="text-white">{user.phone}</span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm text-white/60">Location</label>
          {isEditing ? (
            <input
              type="text"
              value={editedUser.location}
              onChange={(e) =>
                setEditedUser({ ...editedUser, location: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
          ) : (
            <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5">
              <MapPin className="w-5 h-5 text-white/60" />
              <span className="text-white">{user.location}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-sm text-white/60">Bio</label>
          {isEditing ? (
            <textarea
              value={editedUser.bio}
              onChange={(e) =>
                setEditedUser({ ...editedUser, bio: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all resize-none"
            />
          ) : (
            <div className="px-4 py-3 rounded-xl bg-white/5">
              <span className="text-white">{user.bio}</span>
            </div>
          )}
        </div>

        {/* Join Date */}
        <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5">
          <Calendar className="w-5 h-5 text-white/60" />
          <div>
            <span className="text-white/60 text-sm">Joined </span>
            <span className="text-white">{user.joinDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Section
function SettingsSection() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-white/60" />
              <div>
                <div className="text-white">Notifications</div>
                <div className="text-sm text-white/60">
                  Manage your notification preferences
                </div>
              </div>
            </div>
            <div className="w-12 h-6 bg-blue-500 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <Palette className="w-5 h-5 text-white/60" />
              <div>
                <div className="text-white">Theme</div>
                <div className="text-sm text-white/60">Dark mode enabled</div>
              </div>
            </div>
            <div className="w-12 h-6 bg-blue-500 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-white/60" />
              <div>
                <div className="text-white">Language</div>
                <div className="text-sm text-white/60">English (US)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Privacy & Security</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-white/60" />
              <div>
                <div className="text-white">Two-Factor Authentication</div>
                <div className="text-sm text-white/60">
                  Add an extra layer of security
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Page
const ProfilePage = ({ onBack }: { onBack: () => void }) => {
  const [user, setUser] = useState(mockUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [activeSection, setActiveSection] = useState("profile");
  const fileInputRef = useRef<any>(null);

  const handleSave = () => {
    setUser(editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleAvatarChange = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // setEditedUser({ ...editedUser, avatar: e.target?.result });
        console.log(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-screen overflow-auto bg-neutral-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Profile</h1>
          </div>

          <AnimatePresence>
            {isEditing ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center space-x-2"
              >
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-red-500/20 rounded-xl transition-colors text-red-400"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSave}
                  className="p-2 hover:bg-green-500/20 rounded-xl transition-colors text-green-400"
                >
                  <Check className="w-5 h-5" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <Edit3 className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/5 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveSection("profile")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeSection === "profile"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveSection("settings")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeSection === "settings"
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Settings
          </button>
        </div>

        {/* Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeSection === "profile" ? (
            <ProfileSection
              user={user}
              editedUser={editedUser}
              setEditedUser={setEditedUser}
              isEditing={isEditing}
              fileInputRef={fileInputRef}
              handleAvatarChange={handleAvatarChange}
            />
          ) : (
            <SettingsSection />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
