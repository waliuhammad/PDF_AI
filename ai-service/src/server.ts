import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { env } from "./config/env";

// Read through config/env so there is one default rather than two that can
// drift apart — this file used to say 8000 while the app looked for 8001.
app.listen(env.PORT, () => {
  console.log(`🚀 AI Service running on http://localhost:${env.PORT}`);
});