import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "./config/environment.js";

// Helper: force required env at runtime
function reqEnv(name: keyof typeof env): string {
  const v = env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return String(v);
}
const ACCESS_SECRET = reqEnv("JWT_ACCESS_SECRET");
const REFRESH_SECRET = reqEnv("JWT_REFRESH_SECRET");

// JWT
export function signAccess(sub: string) {
  return jwt.sign({ sub }, ACCESS_SECRET, { expiresIn: "15m" });
}
export function signRefresh(sub: string) {
  return jwt.sign({ sub }, REFRESH_SECRET, { expiresIn: "14d" });
}
export function verifyAccess(token: string): { sub: string } {
  return jwt.verify(token, ACCESS_SECRET) as { sub: string };
}
export function verifyRefresh(token: string): { sub: string } {
  return jwt.verify(token, REFRESH_SECRET) as { sub: string };
}

// Passwords
export async function hashPassword(pw: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}
export function comparePassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}
