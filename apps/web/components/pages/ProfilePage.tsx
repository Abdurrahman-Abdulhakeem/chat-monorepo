import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Edit3, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import {
  UpdateProfilePayload,
  useDeleteDevice,
  useUpdateProfile,
} from "@/lib/hooks/user";
import api from "@/lib/api";
import { useDetectAndUpdateLocation } from "@/lib/hooks/location";
import DevicesSection from "./components/DevicesSection";
import ProfileSection from "./components/ProfileSection";
import SettingsSection from "./components/SettingsSection";

const ProfilePage = ({ onBack }: { onBack: () => void }) => {
  const { user, refetchUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UpdateProfilePayload>({
    name: user?.name || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
    avatarUrl: user?.avatarUrl || "",
  });
  const [activeSection, setActiveSection] = useState("profile");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const fileInputRef = useRef(null);
  const { mutateAsync: updateProfile, isPending: isSaving } =
    useUpdateProfile();
  const { mutateAsync: deleteDevice } = useDeleteDevice();
  const { detectAndUpdateLocation } = useDetectAndUpdateLocation();

  useEffect(() => {
    setEditedUser(user ?? {});
  }, [user]);

  const handleSave = async () => {
    console.log(editedUser);
    await updateProfile(editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user ?? {});
    setIsEditing(false);
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("avatar", file);

      await api.post("/auth/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await refetchUser();
    }
  };

  const detectLocation = async () => {
    setIsDetectingLocation(true);
    const detectedLocation = await detectAndUpdateLocation();
    setIsDetectingLocation(false);
    return detectedLocation;
  };

  const handleRemoveDevice = async (deviceId: string) => {
    await deleteDevice(deviceId);
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
            { id: "profile", label: "Profile" },
            { id: "devices", label: "Devices" },
            { id: "settings", label: "Settings" },
          ].map((tab) => (
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
            <DevicesSection user={user} onRemoveDevice={handleRemoveDevice} />
          )}

          {activeSection === "settings" && <SettingsSection />}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
