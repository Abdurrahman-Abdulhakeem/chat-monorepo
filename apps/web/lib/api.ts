import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: false,
});

api.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    const access = localStorage.getItem("access");
    if (access) cfg.headers.Authorization = `Bearer ${access}`;
  }
  return cfg;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config || {};
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!refreshing) {
        refreshing = (async () => {
          try {
            const refresh = localStorage.getItem("refresh");
            if (!refresh) return null;
            const { data } = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
              { refreshToken: refresh }
            );
            localStorage.setItem("access", data.access);
            return data.access as string;
          } catch {
            ["access", "refresh", "userId", "currentDeviceId", "me"].forEach((k) =>
              localStorage.removeItem(k)
            );
            return null;
          } finally {
            refreshing = null;
          }
        })();
      }
      const newTok = await refreshing;
      if (newTok) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newTok}`;
        return api.request(original);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
