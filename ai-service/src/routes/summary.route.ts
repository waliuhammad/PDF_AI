import { Router } from "express";
import multer from "multer";
import { processPDF } from "../modules/pipeline";
import { generateSummary } from "../modules/summary";

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

    // Parse the uploaded PDF and store its embeddings
    await processPDF(req.file.buffer);

    // Generate the summary from the newly stored document
    const result = await generateSummary();

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Summary generation failed.",
    });
  }
});

export default router;