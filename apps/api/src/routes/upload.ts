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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and audio files
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "audio/webm",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "audio/m4a",
      "audio/mpeg",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      throw new Error(`File type ${file.mimetype} not supported`);
    }
  },
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Determine resource type and folder based on file type
    const isAudio = req.file.mimetype.startsWith("audio/");
    const isImage = req.file.mimetype.startsWith("image/");

    const uploadOptions: any = {
      folder: isAudio ? "chat_app/voice_notes" : "chat_app/images",
      resource_type: isAudio ? "video" : "image",
    };

    // For audio files, you might want to add additional options
    if (isAudio) {
      uploadOptions.format = "mp3";
      uploadOptions.audio_codec = "mp3";
      uploadOptions.bit_rate = "64k";
    }

    // Stream buffer to Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("Cloudinary error:", error);
          return res.status(500).json({ error: "Upload failed" });
        }

        // Return additional metadata for voice notes
        const response: any = {
          url: result?.secure_url,
          publicId: result?.public_id,
          format: result?.format,
          resourceType: result?.resource_type,
        };

        // For audio files, include duration if available
        if (isAudio && result?.duration) {
          response.duration = result.duration;
        }

        // For images, include dimensions
        if (isImage) {
          response.width = result?.width;
          response.height = result?.height;
        }

        return res.json(response);
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (err: any) {
    console.error("Upload error:", err);
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large" });
    }
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
          await User.findByIdAndUpdate(userId, {
            avatarUrl: result?.secure_url,
          });

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
