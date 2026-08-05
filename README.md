# PDFAI

A PDF toolkit with AI features: convert, edit, organise and secure PDFs, plus
chat-with-your-document and AI summaries.

Built with Next.js 16 (App Router), React 19, Tailwind v4, and Firebase.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in the values — see below
npm run dev
```

Open http://localhost:3000.

> **Heads up:** several features need external services configured before they
> do anything. The app runs without them and degrades with a clear message
> rather than crashing — see [What needs configuring](#what-needs-configuring).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (also typechecks) |
| `npm start` | Serve a production build |
| `npm run typecheck` | TypeScript only, no build |
| `npm run lint` | ESLint |

---

## What needs configuring

### Firebase (required)

Powers sign-in, the document library, and chats. Fill the `NEXT_PUBLIC_FIREBASE_*`
values in `.env.local` from your Firebase project settings.

**The security rules must also be published**, or every read and write is
rejected and you'll see permission errors throughout the app:

- **Firestore Database → Rules** → paste [`firestore.rules`](firestore.rules) → Publish
- **Storage → Rules** → paste [`storage.rules`](storage.rules) → Publish

The rules are version-controlled here so they're reviewable alongside the code
that depends on them. Notably, the `plan` field is **not** client-writable —
otherwise anyone could grant themselves a paid subscription from the browser
console.

### Gemini (optional — enables the AI features)

```
GEMINI_API_KEY=...
```

Powers chat-with-PDF, summaries, translation and the grammar checker. Free tier
keys come from https://aistudio.google.com/apikey. **Server-side only** — it is deliberately
not prefixed with `NEXT_PUBLIC_`, which would ship your key to every visitor.
Without it, the AI routes return HTTP 501 and the rest of the app works
normally.

### ConvertAPI (optional — enables three tools)

```
CONVERTAPI_SECRET=...
```

Required by `pdf-to-word`, `word-to-pdf` and `rotate-pdf`. Without it those
three return an error; every other tool is unaffected.

---

## How it's organised

```
app/
  (main)/
    login, register, …          auth screens
    about, contact, blog, …     public content pages
    (app)/                      signed-in shell (sidebar)
      merge-pdf, split-pdf, …   the PDF tools — usable without an account
      tools/                    the tool hub
      (protected)/              requires sign-in
        dashboard, documents, chats, settings
  api/
    merge-pdf, split-pdf, …     server-side PDF processing
    ai/{chat,summarize,…}       Gemini-backed AI routes
lib/
  firebase/                     auth, documents, chats — the data layer
  gemini.ts                     server-only AI client
  ai.ts                         client-side AI calls
```

**Route groups in parentheses don't appear in the URL.** `(protected)` exists
purely to scope the auth guard: the PDF tools sit outside it so anonymous
visitors arriving from the marketing pages can still use them.

### Where data lives

```
users/{uid}                              profile
users/{uid}/documents/{docId}            document metadata
users/{uid}/chats/{chatId}               conversation
users/{uid}/chats/{chatId}/messages/{id} messages

Storage:  users/{uid}/{docId}/{filename}
```

Everything nests under `users/{uid}`, so ownership is structural — a rule can't
accidentally expose another user's data.

---

## Contributing

Never commit directly to `main`.

```bash
git checkout main
git pull origin main          # always start from the latest main
git checkout -b feat/my-thing

# … work, then:
git add .
git commit -m "Clear description"
git push -u origin feat/my-thing
```

Then open a pull request.

**Never use `git push --force` on a shared branch.** If your push is rejected,
someone else pushed first — the fix is `git pull --rebase origin main`, then
push again. Force-pushing has already destroyed work on this repo once.

Before merging, check it builds:

```bash
npm run typecheck && npm run build
```

CI runs both on every pull request, and rejects committed conflict markers.

---

## Known gaps

Things that are deliberately unfinished, so nobody rediscovers them the hard way:

- **No authentication on the API routes.** Every `/api/*` route is open,
  including the AI ones — which draw on your Gemini quota per call. Needs verified Firebase ID
  tokens before this goes anywhere public.
- **No billing.** The Pricing page and the `plan` field exist, but nothing moves
  a user between plans and no limits are enforced.
- **Privacy, Terms and Security** are structural skeletons behind a visible
  "not legal advice" notice. They need real copy before launch.
- **No tests.**
