import express from "express";
import multer from "multer";
import { env } from "../config/environment.js";
import { authenticateToken } from "../middleware/auth.js";
import { User } from "../storage.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const router = express.Router();

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // stream buffer - cloudinary
    const stream = cloudinary.uploader.upload_stream(
      { folder: "chat_app" }, // optional folder
      (error, result) => {
        if (error) {
          console.error("Cloudinary error:", error);
          return res.status(500).json({ error: "Upload failed" });
        }
        return res.json({ url: result?.secure_url });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// POST /upload/avatar
router.post(
  "/avatar",
  upload.single("avatar"),
  authenticateToken,
  async (req: any, res: any) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const userId = req.userId;

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "chat_app/avatars",
          transformation: [{ width: 300, height: 300, crop: "fill" }], // resize
        },
        async (error, result) => {
          if (error) {
            console.error("Cloudinary error:", error);
            return res.status(500).json({ error: "Upload failed" });
          }

          // update user profile
          await User.findByIdAndUpdate(userId, { avatarUrl: result?.secure_url });

          res.json({ url: result?.secure_url });
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Profile pic update failed" });
    }
  }
);

export default router;
