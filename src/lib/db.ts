import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";

// D1Database 类型 (Cloudflare Workers)
declare global {
  interface D1Database { }
}

// 用于 Cloudflare Pages Functions
export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

// 类型导出
export type Database = ReturnType<typeof getDb>;
