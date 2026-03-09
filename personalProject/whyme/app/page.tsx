import portfolioData from "@/data/portfolio.json";
import type {
  Portfolio,
  BlogSection as BlogSectionType,
} from "@/types/portfolio";
import { fetchAllBlogPosts } from "@/lib/fetchers";
import { HeroSection } from "@/components/sections/hero-section";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { Footer } from "@/components/footer";
import type { BlogPost } from "@/types/portfolio";

export default async function Home() {
  const data = portfolioData as Portfolio;

  // Pre-fetch blog posts for all blog sections (at build time)
  const blogPostsMap: Record<number, BlogPost[]> = {};

  const blogFetches = data.sections.map(async (section, index) => {
    if (section.type === "blogs") {
      const posts = await fetchAllBlogPosts(
        (section as BlogSectionType).config,
      );
      blogPostsMap[index] = posts;
    }
  });

  await Promise.allSettled(blogFetches);

  return (
    <div className="min-h-screen">
      <HeroSection hero={data.hero} socials={data.socials} />
      <SectionRenderer sections={data.sections} blogPostsMap={blogPostsMap} />
      <Footer socials={data.socials} />
    </div>
  );
}
