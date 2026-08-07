/**
 * Copies a Firebase service account key into .env.local.
 *
 * Doing this by hand means opening the JSON, finding the right field among
 * several similar-looking ones, and pasting ~1700 characters without breaking
 * them across lines. Every one of those steps is a chance to leak the key or to
 * grab private_key_id, which sits on the adjacent line and looks plausible.
 *
 *     node scripts/import-service-account.mjs <path-to-downloaded.json>
 *
 * Nothing is printed except the field names, so the key never reaches a
 * terminal, a log or a screenshot.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const source = process.argv[2];
if (!source) {
    console.error("Usage: node scripts/import-service-account.mjs <path-to-service-account.json>");
    process.exit(1);
}

if (!existsSync(source)) {
    console.error(`No such file: ${source}`);
    process.exit(1);
}

let key;
try {
    key = JSON.parse(readFileSync(source, "utf8"));
} catch {
    console.error(`${source} is not valid JSON. Download the key again.`);
    process.exit(1);
}

const { project_id: projectId, client_email: clientEmail, private_key: privateKey } = key;

const missing = [
    !projectId && "project_id",
    !clientEmail && "client_email",
    !privateKey && "private_key",
].filter(Boolean);

if (missing.length) {
    console.error(`That JSON has no ${missing.join(", ")}. It may not be a service account key.`);
    process.exit(1);
}

if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    console.error("The private_key field does not contain a PEM key. Download the key again.");
    process.exit(1);
}

// .env has no line continuation, so the newlines have to survive as the two
// characters \n. lib/firebase/admin.ts turns them back on the way in. This is
// also the form Railway and Vercel store, so the same value works in all three.
const escaped = privateKey.replace(/\n/g, "\\n");

const vars = {
    FIREBASE_PROJECT_ID: projectId,
    FIREBASE_CLIENT_EMAIL: clientEmail,
    FIREBASE_PRIVATE_KEY: `"${escaped}"`,
};

const envPath = resolve(process.cwd(), ".env.local");
let env = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";

for (const [name, value] of Object.entries(vars)) {
    const line = `${name}=${value}`;
    // Replace in place when it is already there, so an existing file keeps its
    // order and comments rather than growing a duplicate further down that the
    // first one silently wins over.
    const existing = new RegExp(`^${name}=.*$`, "m");
    env = existing.test(env) ? env.replace(existing, line) : `${env.replace(/\s*$/, "\n")}${line}\n`;
}

writeFileSync(envPath, env);

console.log(`Wrote ${Object.keys(vars).join(", ")} to .env.local`);
console.log(`Service account: ${clientEmail}`);
console.log(`Key id: ${key.private_key_id ?? "unknown"}`);
console.log("\nDelete the downloaded JSON now — it is a full admin credential.");
