/* eslint-disable @typescript-eslint/no-explicit-any */
import { Monitor, Smartphone, Tablet, Trash2 } from "lucide-react";

// Device icon helper
const getDeviceIcon = (deviceType: string) => {
  switch (deviceType) {
    case "mobile":
      return Smartphone;
    case "tablet":
      return Tablet;
    default:
      return Monitor;
  }
};

function DevicesSection({ user, onRemoveDevice }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Active Devices</h3>
        <div className="space-y-3">
          {user.devices?.map((device: any) => {
            const DeviceIcon = getDeviceIcon(device.deviceType);
            const lastSeen = new Date(device.lastSeenAt);
            const currentDeviceId = localStorage.getItem("currentDeviceId");
            const isCurrentDevice = device.deviceId === currentDeviceId;

            return (
              <div
                key={device.deviceId}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <DeviceIcon className="w-5 h-5 text-white/60" />
                  <div>
                    <div className="text-white flex items-center space-x-2">
                      <span>
                        {device.browser} on {device.os}
                      </span>
                      {isCurrentDevice && (
                        <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-white/60">
                      Last active:{" "}
                      {lastSeen.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
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
          We keep track of your active devices for security purposes. You can
          remove devices you no longer use.
        </div>
      </div>
    </div>
  );
}

export default DevicesSection;
