import "server-only";
import { getRemoteConfig, type ServerTemplate } from "firebase-admin/remote-config";
import { getAdminApp, isAdminConfigured } from "@/lib/firebase/admin";
import type { PlanId } from "@/lib/plans";

/**
 * Server-side Remote Config: values changeable from the Firebase Console
 * with no redeploy. Read on the server so limits can't be tampered with
 * in the browser.
 *
 * The parameter schema follows what the client created in their project:
 * {cycle}_{plan}_plan_all = how many operations that plan allows per 24h,
 * for weekly/monthly/yearly billing cycles. Two extra parameters of ours
 * (maintenance_banner, ai_tools_enabled) fall back to safe defaults until
 * they exist in the console.
 *
 * Defaults below are the source of truth when Remote Config is unreachable
 * or a parameter doesn't exist, so the app never breaks because a console
 * value is missing.
 */

export type PlanCycle = "weekly" | "monthly" | "yearly";

const DEFAULTS = {
    maintenance_banner: "",
    ai_tools_enabled: "true",

    weekly_free_plan_all: "2",
    weekly_pro_plan_all: "20",
    weekly_business_plan_all: "50",
    monthly_free_plan_all: "2",
    monthly_pro_plan_all: "20",
    monthly_business_plan_all: "50",
    yearly_free_plan_all: "2",
    yearly_pro_plan_all: "20",
    yearly_business_plan_all: "50",
} as const;

export interface AppConfig {
    maintenanceBanner: string;
    aiToolsEnabled: boolean;
    /** Daily operation limits: limits[cycle][plan] = ops per 24 hours. */
    limits: Record<PlanCycle, Record<PlanId, number>>;
}

let template: ServerTemplate | null = null;
let loadedAt = 0;

// One fetch per five minutes per server instance keeps console changes
// near-live without a Firebase call on every request.
const TTL_MS = 5 * 60 * 1000;

// A missing Server template is an expected state (it just hasn't been
// created in the Console yet), not a fault worth repeating on every
// request — warn once, run on defaults, and keep retrying quietly so
// the app picks the template up as soon as someone publishes it.
let warnedMissingTemplate = false;

async function getTemplate(): Promise<ServerTemplate | null> {
    if (!isAdminConfigured()) return null;

    const now = Date.now();
    if (template && now - loadedAt < TTL_MS) return template;

    try {
        const rc = getRemoteConfig(getAdminApp());
        const next = await rc.getServerTemplate({ defaultConfig: DEFAULTS });
        template = next;
        loadedAt = now;
        warnedMissingTemplate = false;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("NOT_FOUND")) {
            if (!warnedMissingTemplate) {
                console.warn(
                    "Remote Config: no Server template published yet — using built-in defaults. " +
                    "Create it in Firebase Console -> Remote Config -> (dropdown) Server."
                );
                warnedMissingTemplate = true;
            }
        } else {
            // Keep serving the previous template (or defaults) rather than fail.
            console.error("Remote Config fetch failed:", err);
        }
    }
    return template;
}

function defaultLimits(): AppConfig["limits"] {
    const limitOf = (key: keyof typeof DEFAULTS) => Number(DEFAULTS[key]);
    return {
        weekly: {
            free: limitOf("weekly_free_plan_all"),
            pro: limitOf("weekly_pro_plan_all"),
            business: limitOf("weekly_business_plan_all"),
        },
        monthly: {
            free: limitOf("monthly_free_plan_all"),
            pro: limitOf("monthly_pro_plan_all"),
            business: limitOf("monthly_business_plan_all"),
        },
        yearly: {
            free: limitOf("yearly_free_plan_all"),
            pro: limitOf("yearly_pro_plan_all"),
            business: limitOf("yearly_business_plan_all"),
        },
    };
}

export async function getAppConfig(): Promise<AppConfig> {
    const t = await getTemplate();

    if (!t) {
        return {
            maintenanceBanner: DEFAULTS.maintenance_banner,
            aiToolsEnabled: DEFAULTS.ai_tools_enabled === "true",
            limits: defaultLimits(),
        };
    }

    const config = t.evaluate();
    const num = (key: string, fallback: number) => {
        const value = config.getNumber(key);
        return Number.isFinite(value) && value > 0 ? value : fallback;
    };

    const d = defaultLimits();

    return {
        maintenanceBanner: config.getString("maintenance_banner"),
        aiToolsEnabled: config.getBoolean("ai_tools_enabled"),
        limits: {
            weekly: {
                free: num("weekly_free_plan_all", d.weekly.free),
                pro: num("weekly_pro_plan_all", d.weekly.pro),
                business: num("weekly_business_plan_all", d.weekly.business),
            },
            monthly: {
                free: num("monthly_free_plan_all", d.monthly.free),
                pro: num("monthly_pro_plan_all", d.monthly.pro),
                business: num("monthly_business_plan_all", d.monthly.business),
            },
            yearly: {
                free: num("yearly_free_plan_all", d.yearly.free),
                pro: num("yearly_pro_plan_all", d.yearly.pro),
                business: num("yearly_business_plan_all", d.yearly.business),
            },
        },
    };
}