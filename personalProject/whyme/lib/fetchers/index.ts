import type { BlogPost, BlogConfig } from "@/types/portfolio";
import { fetchHashnodePosts } from "./hashnode";
import { fetchMediumPosts } from "./medium";

/**
 * Orchestrates fetching from all configured blog sources,
 * merges with manual entries, and returns a unified sorted list.
 */
export async function fetchAllBlogPosts(
    config: BlogConfig
): Promise<BlogPost[]> {
    const posts: BlogPost[] = [];

    // Fetch from each configured source in parallel
    if (config.sources && config.sources.length > 0) {
        const fetches = config.sources.map(async (source) => {
            switch (source.platform) {
                case "hashnode":
                    return fetchHashnodePosts(source);
                case "medium":
                    return fetchMediumPosts(source);
                default:
                    console.warn(`Unknown blog platform: ${source.platform}`);
                    return [];
            }
        });

        const results = await Promise.allSettled(fetches);
        for (const result of results) {
            if (result.status === "fulfilled") {
                posts.push(...result.value);
            } else {
                console.error("Blog fetch failed:", result.reason);
            }
        }
    }

    // Add manual entries
    if (config.manual && config.manual.length > 0) {
        for (const entry of config.manual) {
            posts.push({
                title: entry.title,
                brief: entry.description ?? "",
                url: entry.url,
                coverImage: entry.coverImage,
                platform: entry.platform ?? "other",
                date: entry.date
                    ? new Date(entry.date).toISOString()
                    : new Date().toISOString(),
                tags: [],
            });
        }
    }

    // Sort by date (newest first)
    posts.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return posts;
}
