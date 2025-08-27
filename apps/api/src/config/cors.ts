import { CorsOptions } from "cors";
import { env } from "./environment.js";

const allowedOrigins = env.CORS_ORIGIN.split(",");

export const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman..,)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};