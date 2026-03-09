import Image from "next/image";
import { ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/section-header";
import type { BlogPost } from "@/types/portfolio";

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function BlogSection({
  title,
  posts,
}: {
  title: string;
  posts: BlogPost[];
}) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <SectionHeader title={title} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <a
              key={post.url}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="h-full border-border/40 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-white/15 hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/[0.03]">
                {post.coverImage && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      width={400}
                      height={225}
                      className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-90"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase tracking-widest font-medium"
                    >
                      {post.platform}
                    </Badge>
                    {post.readTime && (
                      <span className="text-xs text-muted-foreground/70">
                        {post.readTime} min read
                      </span>
                    )}
                  </div>
                  <CardTitle className="mt-2 font-display text-base leading-snug transition-colors duration-300 group-hover:text-foreground">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {post.brief && (
                    <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                      {post.brief}
                    </CardDescription>
                  )}
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground/70">
                    <time>{formatDate(post.date)}</time>
                    <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:opacity-70" />
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
