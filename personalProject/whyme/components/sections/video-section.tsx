import Image from "next/image";
import { Play, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/section-header";
import type { VideoItem } from "@/types/portfolio";

/**
 * Extract YouTube video ID from various URL formats to generate thumbnail.
 */
function getYouTubeThumbnail(url: string): string | null {
  try {
    const urlObj = new URL(url);
    let videoId: string | null = null;

    if (
      urlObj.hostname.includes("youtube.com") ||
      urlObj.hostname.includes("youtube-nocookie.com")
    ) {
      videoId = urlObj.searchParams.get("v");
    } else if (urlObj.hostname === "youtu.be") {
      videoId = urlObj.pathname.slice(1);
    }

    return videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : null;
  } catch {
    return null;
  }
}

export function VideoSection({
  title,
  items,
}: {
  title: string;
  items: VideoItem[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <SectionHeader title={title} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((video, index) => {
            const thumbnail = video.thumbnail || getYouTubeThumbnail(video.url);

            return (
              <a
                key={`${video.url}-${index}`}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="h-full border-border/40 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-white/15 hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/[0.03]">
                  {thumbnail && (
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <Image
                        src={thumbnail}
                        alt={video.title}
                        width={400}
                        height={225}
                        className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-90"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors duration-300 group-hover:bg-black/30">
                        <div className="rounded-full bg-white/10 p-3.5 backdrop-blur-md border border-white/20 transition-all duration-300 group-hover:bg-white/20 group-hover:scale-110">
                          <Play className="h-6 w-6 text-white" fill="white" />
                        </div>
                      </div>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    {video.platform && (
                      <Badge
                        variant="secondary"
                        className="w-fit text-[10px] uppercase tracking-widest font-medium"
                      >
                        {video.platform}
                      </Badge>
                    )}
                    <CardTitle className="font-display text-base leading-snug transition-colors duration-300 group-hover:text-foreground">
                      {video.title}
                    </CardTitle>
                  </CardHeader>
                  {video.description && (
                    <CardContent>
                      <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                        {video.description}
                      </CardDescription>
                      <div className="mt-4 flex justify-end">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-70" />
                      </div>
                    </CardContent>
                  )}
                </Card>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
