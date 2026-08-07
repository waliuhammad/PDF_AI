This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment variables

Put these in `.env.local`. Most tools run without any of them; each entry says
what stops working when it is missing.

| Variable | Needed for | Without it |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | Accounts, saved documents, chats | Sign-in and the whole signed-in area fail |
| `AI_SERVICE_URL` | Summary, translate, grammar, OCR, chat | Falls back to `http://localhost:8001` |
| `CONVERTAPI_SECRET` | Word to PDF, PDF to Word | Both return 503 and the tools are unusable |
| `NEXT_PUBLIC_SITE_URL` | `sitemap.xml`, canonical URLs, OG tags | Falls back to the Vercel production host, then `http://localhost:3000`. Set it whenever there is a custom domain |

`NEXT_PUBLIC_*` values are baked in at build time, so changing one means
rebuilding, not just restarting.

The AI tools also need the separate service in `ai-service/` running, with its
own `.env` holding `GOOGLE_API_KEY`. Chat additionally needs a Chroma server on
`CHROMA_PORT`; summary, translate and grammar do not.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
