import { NextRequest, NextResponse } from "next/server";

// 不需要认证的路径
const publicPaths = [
    "/login",
    "/api/auth/login",
    "/api/auth/logout",
    "/api/sync-github", // Cron Job 需要访问
    "/favicon.ico",
    "/icon.svg",
];

// 静态资源路径前缀
const staticPrefixes = ["/_next/", "/static/"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 跳过静态资源
    if (staticPrefixes.some(prefix => pathname.startsWith(prefix))) {
        return NextResponse.next();
    }

    // 跳过公开路径
    if (publicPaths.some(path => pathname === path || pathname.startsWith(path + "/"))) {
        return NextResponse.next();
    }

    // 检查认证 Cookie
    const authToken = request.cookies.get("auth_token");

    if (!authToken || authToken.value !== "authenticated") {
        // 未认证，重定向到登录页
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * 匹配所有路径除了:
         * - _next/static (静态文件)
         * - _next/image (图片优化)
         * - favicon.ico (网站图标)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
