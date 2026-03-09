import type {
  Section,
  VideoSection as VideoSectionType,
  ProjectSection as ProjectSectionType,
  AssignmentSection as AssignmentSectionType,
  AchievementSection as AchievementSectionType,
  BlogPost,
} from "@/types/portfolio";
import { BlogSection } from "./blog-section";
import { VideoSection } from "./video-section";
import { ProjectSection } from "./project-section";
import { AssignmentSection } from "./assignment-section";
import { AchievementSection } from "./achievement-section";

interface SectionRendererProps {
  sections: Section[];
  /** Pre-fetched blog posts keyed by section index */
  blogPostsMap: Record<number, BlogPost[]>;
}

export function SectionRenderer({
  sections,
  blogPostsMap,
}: SectionRendererProps) {
  return (
    <>
      {sections.map((section, index) => {
        switch (section.type) {
          case "blogs":
            return (
              <BlogSection
                key={`${section.type}-${index}`}
                title={section.title}
                posts={blogPostsMap[index] ?? []}
              />
            );
          case "videos":
            return (
              <VideoSection
                key={`${section.type}-${index}`}
                title={section.title}
                items={(section as VideoSectionType).items}
              />
            );
          case "projects":
            return (
              <ProjectSection
                key={`${section.type}-${index}`}
                title={section.title}
                items={(section as ProjectSectionType).items}
              />
            );
          case "assignments":
            return (
              <AssignmentSection
                key={`${section.type}-${index}`}
                title={section.title}
                items={(section as AssignmentSectionType).items}
              />
            );
          case "achievements":
            return (
              <AchievementSection
                key={`${section.type}-${index}`}
                title={section.title}
                items={(section as AchievementSectionType).items}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
