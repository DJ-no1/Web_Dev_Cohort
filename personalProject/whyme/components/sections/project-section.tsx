import { ExternalLink, Github } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/section-header";
import type { ProjectItem } from "@/types/portfolio";

export function ProjectSection({
  title,
  items,
}: {
  title: string;
  items: ProjectItem[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <SectionHeader title={title} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((project) => (
            <Card
              key={project.title}
              className="group h-full border-border/40 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-white/15 hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/[0.03]"
            >
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base transition-colors duration-300 group-hover:text-foreground">
                  {project.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                <div>
                  <CardDescription className="text-sm leading-relaxed">
                    {project.description}
                  </CardDescription>
                  {project.tech && project.tech.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.tech.map((t) => (
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
                </div>
                <div className="flex items-center gap-4 border-t border-border/30 pt-3">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Live</span>
                  </a>
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground"
                    >
                      <Github className="h-3.5 w-3.5" />
                      <span>Source</span>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
