import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import parserRoute from "./routes/parser.route";
import summaryRoute from "./routes/summary.route";
import grammarRoute from "./routes/grammar.route";
import translateRoute from "./routes/translate.route";
import ocrRoute from "./routes/ocr.route";
const app = express();

// Middleware
// 100kb default is far too small: summary/translate/grammar receive whole
// documents as JSON text, and a 413 on a normal PDF is not acceptable.
app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api", parserRoute);
app.use("/api/summary", summaryRoute);
app.use("/api/grammar", grammarRoute);
app.use("/api/translate", translateRoute);
app.use("/api", ocrRoute);
// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "AI Service",
    version: "1.0.0",
  });
});

/**
 * Every unhandled error leaves here as JSON.
 *
 * Multer runs as middleware, so the errors it raises — a rejected file type, a
 * file over the size limit, a disk that could not be written — never reach the
 * route handlers' own try/catch. They went to Express's default handler, which
 * replies with an HTML page. The only caller is the website, which parses every
 * reply as JSON, so an HTML error became a parse failure and was reported to
 * the user as "Unable to connect to AI Service." — naming the wrong problem and
 * hiding the real one.
 *
 * The size and type cases are answered here as 400s, which is also what makes
 * the matching branches inside the OCR route reachable at all.
 */
// The unused `next` is not optional: Express decides a handler is an error
// handler by its arity, and dropping the fourth parameter turns this back into
// ordinary middleware that never runs.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("ai-service:", error);

  const message = error instanceof Error ? error.message : "";
  const code = (error as { code?: string } | null)?.code;

  if (code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "File size exceeds 20 MB." });
  }

  if (message === "Unsupported file type.") {
    return res.status(400).json({ success: false, message });
  }

  return res.status(500).json({ success: false, message: "The AI service could not handle that request." });
});

export default app;