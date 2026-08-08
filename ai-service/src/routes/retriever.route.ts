import { Router } from "express";
import { retrieveRelevantChunks } from "../modules/retriever";

const router = Router();

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

    const result = await retrieveRelevantChunks(question, sessionId);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Retriever failed.",
    });
  }
});

export default router;