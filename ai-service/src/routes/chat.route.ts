import { Router } from "express";
import { upstreamBusy } from "../modules/shared/upstream";
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
 *
 * sessionId arrives as a multipart form field alongside the file, and picks
 * which Chroma collection the document lands in. It is required: without
 * one, uploads would share a bucket and users would overwrite each other.
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No PDF uploaded.",
      });
    }

    const sessionId = req.body?.sessionId;
    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({
        success: false,
        message: "sessionId is required.",
      });
    }

    const result = await processPDF(req.file.buffer, sessionId);

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
    const { question, sessionId } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required.",
      });
    }

    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({
        success: false,
        message: "sessionId is required.",
      });
    }

    // Retrieve relevant chunks from this session's collection
    const retrieval = await retrieveRelevantChunks(question, sessionId);

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
  } catch (error) {
    console.error(error);

    // Same as the other AI routes: a quota limit or a saturated model is not a
    // failed question, and saying so lets the visitor just ask again.
    const busy = upstreamBusy(error);
    if (busy) return res.status(busy.status).json(busy.body);

    return res.status(500).json({
      success: false,
      message: "Chat failed.",
    });
  }
});

export default router;