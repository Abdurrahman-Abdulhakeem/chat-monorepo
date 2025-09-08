/* eslint-disable @typescript-eslint/no-explicit-any */
export function setSession({
  access,
  refresh,
  user,
  currentDeviceId,
}: {
  access: string;
  refresh: string;
  user: any;
  currentDeviceId: string;
}) {
  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
  localStorage.setItem("currentDeviceId", currentDeviceId);
  localStorage.setItem("userId", user._id || user.id);
  localStorage.setItem("me", JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("currentDeviceId");
  localStorage.removeItem("userId");
  localStorage.removeItem("me");
}
export function me() {
  try {
    return JSON.parse(localStorage.getItem("me") || "null");
  } catch {
    return null;
  }
}
