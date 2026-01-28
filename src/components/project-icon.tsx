import { Project } from "@/db/schema";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProjectIconProps {
    project: Project;
    className?: string;
    size?: number;
}

export function ProjectIcon({ project, className, size = 64 }: ProjectIconProps) {
    let faviconUrl: string | null = null;

    if (project.siteUrl) {
        try {
            // 确保 URL 有协议前缀
            let urlString = project.siteUrl;
            if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
                urlString = 'https://' + urlString;
            }

            const url = new URL(urlString);
            faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=${size}`;
        } catch (error) {
            // URL 解析失败，使用 null 作为降级
            console.warn(`Failed to parse URL for project ${project.name}:`, project.siteUrl);
            faviconUrl = null;
        }
    }

    return (
        <div className={cn("relative overflow-hidden flex items-center justify-center bg-primary/10 text-primary font-bold", className)}>
            {faviconUrl ? (
                <Image
                    src={faviconUrl}
                    alt={project.name}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                        // 如果图片加载失败，隐藏图片显示首字母
                        e.currentTarget.style.display = 'none';
                    }}
                />
            ) : null}
            {/* 总是渲染首字母作为后备 */}
            <span className={cn("text-[inherit] absolute", faviconUrl && "opacity-0")}>
                {project.name.substring(0, 2).toUpperCase()}
            </span>
        </div>
    );
}
