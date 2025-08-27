import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/environment.js";

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try { 
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
    (req as AuthenticatedRequest).userId = payload.sub;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}