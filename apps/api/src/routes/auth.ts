import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { authenticateToken } from "../middleware/auth.js";
import { User } from "../storage.js";
import { signAccess, signRefresh, verifyRefresh } from "../auth.js";

const router = Router();

// Helper function to extract device info
const extractDeviceInfo = (req: Request) => {
  const userAgent = req.headers["user-agent"] || "";
  const ip =
    (req.ip as string) ||
    (req.connection as any)?.remoteAddress ||
    (req.headers["x-forwarded-for"] as string);

  return {
    userAgent,
    ip,
    deviceType: getDeviceType(userAgent),
    browser: getBrowser(userAgent),
    os: getOS(userAgent),
    lastSeenAt: new Date(),
  };
};

const getDeviceType = (userAgent: string) => {
  if (/mobile/i.test(userAgent)) return "mobile";
  if (/tablet/i.test(userAgent)) return "tablet";
  return "desktop";
};

const getBrowser = (userAgent: string) => {
  if (userAgent.includes("Chrome")) return "Chrome";
  if (userAgent.includes("Firefox")) return "Firefox";
  if (userAgent.includes("Safari")) return "Safari";
  if (userAgent.includes("Edge")) return "Edge";
  return "Unknown";
};

const getOS = (userAgent: string) => {
  if (userAgent.includes("Windows")) return "Windows";
  if (userAgent.includes("Mac")) return "macOS";
  if (userAgent.includes("Linux")) return "Linux";
  if (userAgent.includes("Android")) return "Android";
  if (userAgent.includes("iOS")) return "iOS";
  return "Unknown";
};

// Generate unique device ID
const generateDeviceId = (userAgent: string, ip: string) => {
  return crypto
    .createHash("sha256")
    .update(`${userAgent}-${ip}`)
    .digest("hex")
    .substring(0, 16);
};

// Register endpoint with device tracking
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const deviceInfo = extractDeviceInfo(req);
    const deviceId = generateDeviceId(
      deviceInfo.userAgent,
      deviceInfo.ip || ""
    );

    const user = new User({
      name,
      email,
      passwordHash,
      devices: [{ deviceId, ...deviceInfo }],
    });

    await user.save();

    const id: string = user._id.toString();
    const accessToken = signAccess(id);
    const refreshToken = signRefresh(id);

    res.status(201).json({
      message: "User registered successfully",
      token: { 
        access: accessToken, 
        refresh: refreshToken 
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login endpoint with device tracking
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user: any = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const deviceInfo = extractDeviceInfo(req);
    const deviceId = generateDeviceId(
      deviceInfo.userAgent,
      deviceInfo.ip || ""
    );

    const existingDeviceIndex = user.devices.findIndex(
      (d: any) => d.deviceId === deviceId
    );
    if (existingDeviceIndex >= 0) {
      user.devices[existingDeviceIndex] = { deviceId, ...deviceInfo };
    } else {
      user.devices.push({ deviceId, ...deviceInfo });
    }

    await user.save();

    const id: any = user._id.toString();
    const accessToken = signAccess(id);
    const refreshToken = signRefresh(id);

    res.json({
      message: "Login successful",
      token: { 
        access: accessToken, 
        refresh: refreshToken 
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        createdAt: user.createdAt,
        devices: user.devices.map((d: any) => ({
          deviceId: d.deviceId,
          deviceType: d.deviceType,
          browser: d.browser,
          os: d.os,
          lastSeenAt: d.lastSeenAt,
        })),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Refresh
router.post("/refresh", async (req: any, res: any) => { 
  try {
    const { refreshToken } = req.body;
    const payload = verifyRefresh(refreshToken);
    const accessToken = signAccess(payload.sub);
    return res.json({ access: accessToken });
  } catch (err) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

// Get user profile
router.get("/profile", authenticateToken, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        createdAt: user.createdAt,
        devices: user.devices.map((d: any) => ({
          deviceId: d.deviceId,
          deviceType: d.deviceType,
          browser: d.browser,
          os: d.os,
          ip: d.ip,
          lastSeenAt: d.lastSeenAt,
        })),
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user profile
router.put("/profile", authenticateToken, async (req: any, res: Response) => {
  try {
    const { name, phone, bio, location, avatarUrl } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;
    if (location) updateData.location = location;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;


    const user = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove device
router.delete("/devices/:deviceId", authenticateToken, async (req: any, res: Response) => {
  try {
    const { deviceId } = req.params;

    const user: any = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.devices = user.devices.filter((d: any) => d.deviceId !== deviceId);
    await user.save();

    res.json({ message: "Device removed successfully" });
  } catch (error) {
    console.error("Device removal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}); 

export default router;
