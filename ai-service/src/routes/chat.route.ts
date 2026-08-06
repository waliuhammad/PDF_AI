import { Router } from "express";
import multer from "multer";

import { processPDF } from "../modules/pipeline";
import { retrieveRelevantChunks } from "../modules/retriever";
import { generateAnswer, joinChunks } from "../modules/generator";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

/**
 * Upload PDF
 * POST /api/chat/upload
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF uploaded.",
      });
    }

    const result = await processPDF(req.file.buffer);

    return res.status(200).json({
      success: true,
      message: "PDF uploaded successfully.",
      result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to process PDF.",
    });
  }
});

/**
 * Chat with uploaded PDF
 * POST /api/chat
 */
router.post("/", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required.",
      });
    }

    // Retrieve relevant chunks from Chroma
    const retrieval = await retrieveRelevantChunks(question);

    // Generate answer with Gemini
    const generation = await generateAnswer(
      question,
      joinChunks(retrieval.chunks)
    );

    return res.status(200).json({
      success: true,
      result: {
        answer: generation.answer,
      },
      retrievedChunks: retrieval.totalFound,
    });
  } catch (error: any) {
    console.error(error);

    // Same as the other AI routes: a quota limit is not a failed question.
    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Chat failed.",
    });
  }
});

export default router;