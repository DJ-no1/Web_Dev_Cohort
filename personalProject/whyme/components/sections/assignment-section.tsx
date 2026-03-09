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
import type { AssignmentItem } from "@/types/portfolio";

export function AssignmentSection({
  title,
  items,
}: {
  title: string;
  items: AssignmentItem[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <SectionHeader title={title} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((assignment) => (
            <a
              key={assignment.title}
              href={assignment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="h-full border-border/40 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-white/15 hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/[0.03]">
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-base leading-snug transition-colors duration-300 group-hover:text-foreground">
                    {assignment.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {assignment.description && (
                    <CardDescription className="text-sm leading-relaxed">
                      {assignment.description}
                    </CardDescription>
                  )}
                  {assignment.tech && assignment.tech.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {assignment.tech.map((t) => (
                        <Badge
                          key={t}
                          variant="secondary"
                          className="text-[10px] font-normal tracking-wide"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-70" />
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
