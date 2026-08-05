import { Router } from "express";
import { retrieveRelevantChunks } from "../modules/retriever";
import { generateAnswer } from "../modules/generator";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required.",
      });
    }

    // Retrieve relevant chunks
    const retrieval = await retrieveRelevantChunks(question);

    // Generate answer
    const generation = await generateAnswer(
      question,
      retrieval.chunks
    );

    return res.status(200).json({
      success: true,
      answer: generation.answer,
      retrievedChunks: retrieval.totalFound,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Chat failed.",
    });
  }
});

export default router;