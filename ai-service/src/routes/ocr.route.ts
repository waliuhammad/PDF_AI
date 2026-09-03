import fs from "fs/promises";
import fsSync from "fs";
import { extractTextWithOCR } from "../modules/ocr";
import { upstreamBusy } from "../modules/shared/upstream";

import { Router } from "express";
import multer from "multer";
import path from "path";

const router = Router();

/**
 * Where the upload lands before Gemini reads it.
 *
 * Absolute, and created on startup. It used to be the relative string
 * "uploads/", which resolves against the process's working directory and
 * assumed both that the directory exists and that the service was started from
 * its own root. When either was untrue — a deploy whose checkout did not carry
 * the empty directory, a start from elsewhere — multer failed with ENOENT
 * inside its middleware, Express answered with its default HTML error page,
 * and the caller's `response.json()` choked on the HTML and reported it as
 * "Unable to connect to AI Service." OCR was the only route affected because
 * it is the only one writing to disk; the other four use memory storage.
 *
 * mkdir is recursive and therefore safe to run when it already exists.
 */
const UPLOAD_DIR = path.resolve(__dirname, "../../uploads");
fsSync.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type."));
    }
  },
});
router.post("/ocr", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    const result = await extractTextWithOCR(req.file.path);

    return res.status(200).json({
      success: true,
      message: "Text extracted successfully.",
      result,
    });

  } catch (error) {
    console.error(error);

    const busy = upstreamBusy(error);
    if (busy) return res.status(busy.status).json(busy.body);

    // Two specific failures are worth reporting as 400 rather than 500: our own
    // unsupported-type guard, and multer's size limit, which arrives as a code
    // rather than a message.
    const message = error instanceof Error ? error.message : "";
    const code = (error as { code?: string } | null)?.code;

    if (message === "Unsupported file type.") {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    if (code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 20 MB.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "OCR failed.",
    });
  } finally {
    // In a finally, not after the success path, because that is where it was:
    // any OCR that threw left its upload behind for good. On a long-lived
    // container those accumulate until the disk fills, and the files are
    // customer documents nobody meant to keep. Cleanup failures are logged
    // rather than thrown — the caller already has their answer by now.
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error("could not remove the temporary upload", cleanupError);
      }
    }
  }
});

export default router;