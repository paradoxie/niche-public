import { D1Database } from "@cloudflare/workers-types";

declare global {
    interface CloudflareEnv {
        DB: D1Database;
        GITHUB_TOKEN?: string;
        CRON_SECRET?: string;
        ADMIN_PASSWORD?: string;
    }
}

export { };
