import { Router } from "express";
import multer from "multer";
import { extractText } from "../modules/pipeline";
import { checkGrammar } from "../modules/grammar";

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

    // Parse + Clean + Chunk (no embeddings needed here)
    const extraction = await extractText(req.file.buffer);

    if (extraction.chunker.chunks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This PDF contains no readable text.",
      });
    }

    const documentText = extraction.chunker.chunks
      .map((chunk) => chunk.content)
      .filter(Boolean)
      .join(" ");

    const result = await checkGrammar(documentText);

    return res.status(200).json({
      success: true,
      result,
    });

  } catch (error: any) {
    console.error(error);

    if (error?.status === 429) {
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