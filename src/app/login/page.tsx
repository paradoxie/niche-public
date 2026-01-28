"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { fadeSlideUp } from "@/lib/animations";

export default function LoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json() as { success?: boolean; message?: string };

            if (res.ok && data.success) {
                router.push("/");
                router.refresh();
            } else {
                setError(data.message || "登录失败");
            }
        } catch (err) {
            setError("网络错误，请重试");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
            {/* 背景装饰 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                className="w-full max-w-md relative z-10"
                variants={fadeSlideUp}
                initial="hidden"
                animate="show"
            >
                {/* Logo 区域 */}
                <div className="text-center mb-8">
                    <motion.div
                        className="mx-auto w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-lg shadow-primary/30 mb-6"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                    >
                        NS
                    </motion.div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        NicheStack
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Niche 站点管理控制台
                    </p>
                </div>

                <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/80">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl">欢迎回来</CardTitle>
                        <CardDescription>
                            请输入管理密码以继续访问
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <motion.div
                                    className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-sm">{error}</span>
                                </motion.div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password">密码</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="请输入管理密码"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoFocus
                                    disabled={isLoading}
                                    className="h-11"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11"
                                disabled={isLoading || !password}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        登录中...
                                    </>
                                ) : (
                                    "登录"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground mt-8">
                    © 2024 NicheStack. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
}
