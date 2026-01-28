import { drizzle } from "drizzle-orm/d1";
import { getRequestContext } from "@cloudflare/next-on-pages";
import * as schema from "./schema";

export const getDb = () => {
    // 在 Edge Runtime (Cloudflare Pages) 中
    try {
        const { env } = getRequestContext();
        if (env && env.DB) {
            return drizzle(env.DB, { schema });
        }
    } catch (e) {
        // 本地开发或构建时可能没有 RequestContext
        console.warn("Could not get Cloudflare D1 binding via getRequestContext");
    }

    // TODO: 本地开发支持 (可以使用 better-sqlite3 如果需要)
    throw new Error("Database binding not found. Are you running in Cloudflare Pages?");
};
