/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
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
  Monitor,
  Smartphone,
  Tablet,
  MapPinIcon,
  Loader2,
  Trash2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { UpdateProfilePayload, useUpdateProfile } from "@/lib/hooks/user";
import api from "@/lib/api";

// Mock user data for demo
export const mockUser = {
  id: "1",
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  phone: "+234 222 123 4567",
  location: "Lagos, Nigeria",
  bio: "Passionate about technology and connecting with people around the world.",
  avatarUrl: "",
  createdAt: "2025-01-15T10:30:00Z",
  status: "online",
  devices: [
    {
      deviceId: "abc123",
      deviceType: "desktop",
      browser: "Chrome",
      os: "Windows",
      lastSeenAt: "2025-01-20T14:30:00Z"
    },
    {
      deviceId: "def456",
      deviceType: "mobile",
      browser: "Safari",
      os: "iOS",
      lastSeenAt: "2025-01-19T09:15:00Z"
    }
  ]
};

// Device icon helper
const getDeviceIcon = (deviceType: string) => {
  switch (deviceType) {
    case 'mobile': return Smartphone;
    case 'tablet': return Tablet;
    default: return Monitor;
  }
};

// Profile Section Component
function ProfileSection({
  user,
  editedUser,
  setEditedUser,
  isEditing,
  fileInputRef,
  handleAvatarChange,
  detectLocation,
  isDetectingLocation
}: any) {
  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
            <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden">
              {(isEditing ? editedUser.avatarUrl : user.avatarUrl) ? (
                <img
                  src={isEditing ? editedUser.avatarUrl : user.avatarUrl}
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
          <div className={`w-3 h-3 rounded-full ${
            user.status === 'online' ? 'bg-green-500 animate-pulse' :
            user.status === 'away' ? 'bg-yellow-500' :
            user.status === 'busy' ? 'bg-red-500' : 'bg-gray-500'
          }`}></div>
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
              value={editedUser.phone || ''}
              onChange={(e) =>
                setEditedUser({ ...editedUser, phone: e.target.value })
              }
              placeholder="Enter phone number"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
          ) : (
            <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5">
              <Phone className="w-5 h-5 text-white/60" />
              <span className="text-white">{user.phone || 'No phone number'}</span>
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
                  value={editedUser.location || ''}
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
              <span className="text-white">{user.location || 'No location set'}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-sm text-white/60">Bio</label>
          {isEditing ? (
            <textarea
              value={editedUser.bio || ''}
              onChange={(e) =>
                setEditedUser({ ...editedUser, bio: e.target.value })
              }
              rows={3}
              placeholder="Tell us about yourself..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all resize-none"
            />
          ) : (
            <div className="px-4 py-3 rounded-xl bg-white/5">
              <span className="text-white">{user.bio || 'No bio added'}</span>
            </div>
          )}
        </div>

        {/* Join Date */}
        <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5">
          <Calendar className="w-5 h-5 text-white/60" />
          <div>
            <span className="text-white/60 text-sm">Joined </span>
            <span className="text-white">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Section Component
function SettingsSection() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    twoFactor: false
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
            <button
              onClick={() => toggleSetting('notifications')}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                settings.notifications ? 'bg-blue-500' : 'bg-white/20'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                settings.notifications ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>
          
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <Palette className="w-5 h-5 text-white/60" />
              <div>
                <div className="text-white">Theme</div>
                <div className="text-sm text-white/60">Dark mode enabled</div>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('darkMode')}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                settings.darkMode ? 'bg-blue-500' : 'bg-white/20'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                settings.darkMode ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </button>
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
            <button
              onClick={() => toggleSetting('twoFactor')}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                settings.twoFactor ? 'bg-blue-500' : 'bg-white/20'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                settings.twoFactor ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Devices Section Component
function DevicesSection({ user, onRemoveDevice }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Active Devices</h3>
        <div className="space-y-3">
          {user.devices?.map((device: any) => {
            const DeviceIcon = getDeviceIcon(device.deviceType);
            const lastSeen = new Date(device.lastSeenAt);
            const isCurrentDevice = device.deviceId === device.deviceId;
            return (
              <div key={device.deviceId} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center space-x-3">
                  <DeviceIcon className="w-5 h-5 text-white/60" />
                  <div>
                    <div className="text-white flex items-center space-x-2">
                      <span>{device.browser} on {device.os}</span>
                      {isCurrentDevice && (
                        <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-white/60">
                      Last active: {lastSeen.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                {!isCurrentDevice && (
                  <button
                    onClick={() => onRemoveDevice(device.deviceId)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="text-xs text-white/60 px-4">
          We keep track of your active devices for security purposes. You can remove devices you no longer use.
        </div>
      </div>
    </div>
  );
}

// Main Profile Page Component
const ProfilePage = ({ onBack }: {onBack: () => void}) => {
  // const [user, setUser] = useState(mockUser);
  const { user, refetchUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] =  useState<UpdateProfilePayload>({
  name: user?.name || "",
  phone: user?.phone || "",
  location: user?.location || "",
  bio: user?.bio || "",
  avatarUrl: user?.avatarUrl || "",
});
  const [activeSection, setActiveSection] = useState("profile");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const fileInputRef = useRef(null);
  const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateProfile();

  useEffect(() => {
    setEditedUser(user ?? {});
  }, [user]);

  const handleSave = async () => {
    console.log(editedUser)
      await updateProfile(editedUser);
      setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user ?? {});
    setIsEditing(false);
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("avatar", file);

      await api.post("/auth/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      await refetchUser();

    }
  };

  const detectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      // Simulate location detection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you'd use the userService.detectAndUpdateLocation()
      // const detectedLocation = "Lagos, Nigeria"; // Mock detected location
      // setEditedUser({ ...editedUser, location: detectedLocation });
    } catch (error) {
      console.error('Location detection failed:', error);
      // Handle error
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      // In a real app: await userService.removeDevice(deviceId);
      
      // Update local state
      // setUser(prev => ({
      //   ...prev,
      //   devices: prev.devices.filter(d => d.deviceId !== deviceId)
      // }));
      console.log(deviceId);
    } catch (error) {
      console.error('Failed to remove device:', error);
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
              className="md:hidden p-2 -ml-2 hover:bg-white/10 rounded-xl transition-colors"
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
                  disabled={isSaving}
                  className="p-2 hover:bg-red-500/20 rounded-xl transition-colors text-red-400 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="p-2 hover:bg-green-500/20 rounded-xl transition-colors text-green-400 disabled:opacity-50 flex items-center"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
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
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'devices', label: 'Devices' },
            { id: 'settings', label: 'Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeSection === tab.id
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeSection === "profile" && (
            <ProfileSection
              user={user}
              editedUser={editedUser}
              setEditedUser={setEditedUser}
              isEditing={isEditing}
              fileInputRef={fileInputRef}
              handleAvatarChange={handleAvatarChange}
              detectLocation={detectLocation}
              isDetectingLocation={isDetectingLocation}
            />
          )}
          
          {activeSection === "devices" && (
            <DevicesSection
              user={user}
              onRemoveDevice={handleRemoveDevice}
            />
          )}
          
          {activeSection === "settings" && <SettingsSection />}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;