import { Router } from "express";
import multer from "multer";
import { processPDF } from "../modules/pipeline";
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

    // Parse + Clean + Chunk + Embed + Store
    const pipeline = await processPDF(req.file.buffer);

    if (pipeline.chunker.chunks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This PDF contains no readable text.",
      });
    }

    const result = await checkGrammar();

    return res.status(200).json({
      success: true,
      result,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Grammar check failed.",
    });
  }
});

export default router;