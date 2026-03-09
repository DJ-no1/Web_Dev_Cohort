import { ExternalLink, Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/section-header";
import type { AchievementItem } from "@/types/portfolio";

export function AchievementSection({
  title,
  items,
}: {
  title: string;
  items: AchievementItem[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <SectionHeader title={title} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((achievement) => {
            const Wrapper = achievement.url ? "a" : "div";
            const linkProps = achievement.url
              ? {
                  href: achievement.url,
                  target: "_blank" as const,
                  rel: "noopener noreferrer",
                }
              : {};

            return (
              <Wrapper key={achievement.title} {...linkProps} className="group">
                <Card className="h-full border-border/40 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-white/15 hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/[0.03]">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.06] transition-colors duration-300 group-hover:bg-white/10">
                        <Trophy className="h-3.5 w-3.5 text-muted-foreground transition-colors duration-300 group-hover:text-foreground" />
                      </div>
                      <CardTitle className="font-display text-base leading-snug transition-colors duration-300 group-hover:text-foreground">
                        {achievement.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {achievement.description && (
                      <CardDescription className="text-sm leading-relaxed">
                        {achievement.description}
                      </CardDescription>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {achievement.issuer && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-normal tracking-wide"
                        >
                          {achievement.issuer}
                        </Badge>
                      )}
                      {achievement.date && (
                        <span className="text-[10px] text-muted-foreground/70">
                          {new Date(achievement.date).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short" },
                          )}
                        </span>
                      )}
                    </div>
                    {achievement.url && (
                      <div className="mt-4 flex justify-end">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-70" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
