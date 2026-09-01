import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * What Railway polls to decide whether a new deploy is live.
 *
 * The healthcheck used to point at `/`, which is the marketing homepage: a
 * server component that renders the hero, the tool grid and the pricing table,
 * and reads Remote Config on the way. That made the deploy gate depend on
 * things that have nothing to do with whether the server is up — a slow
 * Firebase read on a cold container is enough to fail the check and roll the
 * deploy back.
 *
 * Deliberately not a readiness check for Firebase or the AI service. Those are
 * dependencies the app degrades around by design — the 21 PDF tools work with
 * neither — so a deploy that cannot reach them is still a deploy worth serving.
 */
export function GET() {
    return NextResponse.json({
        status: "ok",
        service: "web",
        commit: process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
        at: new Date().toISOString(),
    })
}