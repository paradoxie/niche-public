"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/context";
import { FileQuestion, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
    const { t } = useTranslation();

    return (
        <div className="h-[80vh] w-full flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative flex items-center justify-center"
            >
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative bg-card p-12 rounded-3xl border border-border/50 shadow-2xl text-center space-y-6 max-w-lg w-full backdrop-blur-sm">

                    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                        <FileQuestion className="h-12 w-12 text-muted-foreground" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                            404
                        </h1>
                        <h2 className="text-xl font-semibold">{t("common.notFound")}</h2>
                        <p className="text-muted-foreground">
                            {t("common.notFoundDesc")}
                        </p>
                    </div>

                    <div className="pt-4">
                        <Button asChild className="w-full gap-2" size="lg">
                            <Link href="/">
                                <Home className="h-4 w-4" />
                                {t("common.backHome")}
                            </Link>
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
