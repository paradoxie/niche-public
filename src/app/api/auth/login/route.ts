import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as { password?: string };
        const password = body.password;

        // 从 Cloudflare 环境获取密码，或使用 process.env
        let adminPassword = ADMIN_PASSWORD;
        try {
            const { env } = getRequestContext();
            adminPassword = env.ADMIN_PASSWORD || ADMIN_PASSWORD;
        } catch {
            // 本地开发环境可能没有 Cloudflare context
        }

        // 如果没有配置密码，允许访问（方便开发）
        if (!adminPassword) {
            const response = NextResponse.json({ success: true, message: "No password configured" });
            response.cookies.set("auth_token", "authenticated", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7, // 7 天
                path: "/",
            });
            return response;
        }

        // 验证密码
        if (password !== adminPassword) {
            return NextResponse.json(
                { success: false, message: "密码错误" },
                { status: 401 }
            );
        }

        // 设置认证 Cookie
        const response = NextResponse.json({ success: true });
        response.cookies.set("auth_token", "authenticated", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 天
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { success: false, message: "服务器错误" },
            { status: 500 }
        );
    }
}
