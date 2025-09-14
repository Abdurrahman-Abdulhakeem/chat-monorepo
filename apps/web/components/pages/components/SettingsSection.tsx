import { Bell, Globe, Palette, Shield } from "lucide-react";
import { useState } from "react";

function SettingsSection() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    twoFactor: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
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
              onClick={() => toggleSetting("notifications")}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                settings.notifications ? "bg-blue-700/60" : "bg-white/20"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  settings.notifications ? "translate-x-6" : "translate-x-0.5"
                }`}
              ></div>
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
              onClick={() => toggleSetting("darkMode")}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                settings.darkMode ? "bg-blue-700/60" : "bg-white/20"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  settings.darkMode ? "translate-x-6" : "translate-x-0.5"
                }`}
              ></div>
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
              onClick={() => toggleSetting("twoFactor")}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                settings.twoFactor ? "bg-blue-700/60" : "bg-white/20"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  settings.twoFactor ? "translate-x-6" : "translate-x-0.5"
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsSection;
