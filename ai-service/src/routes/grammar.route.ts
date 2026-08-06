import { Router } from "express";
import multer from "multer";
import { extractText } from "../modules/pipeline";
import { checkGrammar } from "../modules/grammar";
import { AiBusyError } from "../modules/generator";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF uploaded.",
      });
    }

    // Parse + Clean + Chunk
    const extraction = await extractText(req.file.buffer);

    if (extraction.chunker.chunks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This PDF contains no readable text.",
      });
    }

    const result = await checkGrammar(extraction.cleaner.cleanedText);

    return res.status(200).json({
      success: true,
      result,
    });

  } catch (error) {
    console.error(error);

    // A rate limit is not a failed document — say so, and say for how long.
    if (error instanceof AiBusyError) {
      if (error.retryAfterSeconds) res.setHeader("Retry-After", String(error.retryAfterSeconds));
      return res.status(429).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Grammar check failed.",
    });
  }
});

export default router;