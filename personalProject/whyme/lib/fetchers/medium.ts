import type { BlogPost, BlogSource } from "@/types/portfolio";

/**
 * Fetches blog posts from a Medium RSS feed.
 * RSS feeds are available at: https://medium.com/feed/@username
 * Note: Medium RSS typically returns only ~10 most recent posts.
 */

interface RSSItem {
    title: string;
    link: string;
    description: string;
    pubDate: string;
    categories: string[];
    thumbnail?: string;
}

function extractThumbnail(html: string): string | undefined {
    // Try to extract the first <img> src from content:encoded
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/);
    return match?.[1];
}

function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .trim();
}

function parseRSSItems(xml: string): RSSItem[] {
    const items: RSSItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];

        const title =
            itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ??
            itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1] ??
            "Untitled";

        const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "";

        const contentEncoded =
            itemXml.match(
                /<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/
            )?.[1] ?? "";

        const descriptionRaw =
            itemXml.match(
                /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/
            )?.[1] ??
            itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1] ??
            "";

        const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "";

        const categories: string[] = [];
        const catRegex = /<category><!\[CDATA\[([\s\S]*?)\]\]><\/category>/g;
        let catMatch;
        while ((catMatch = catRegex.exec(itemXml)) !== null) {
            categories.push(catMatch[1]);
        }

        const thumbnail = extractThumbnail(contentEncoded || descriptionRaw);
        const description = stripHtml(descriptionRaw).slice(0, 200);

        items.push({ title, link, description, pubDate, categories, thumbnail });
    }

    return items;
}

function getSlugFromUrl(url: string): string {
    try {
        const pathname = new URL(url).pathname;
        // Medium URLs: /@user/title-hash or /p/hash
        const parts = pathname.split("/").filter(Boolean);
        return parts[parts.length - 1] ?? url;
    } catch {
        return url;
    }
}

export async function fetchMediumPosts(
    source: BlogSource
): Promise<BlogPost[]> {
    const feedUrl = `https://medium.com/feed/${source.host}`;

    try {
        const res = await fetch(feedUrl, {
            next: { revalidate: 3600 },
        });

        if (!res.ok) {
            console.error(`Medium RSS error: ${res.status}`);
            return [];
        }

        const xml = await res.text();
        const items = parseRSSItems(xml);

        let filtered: RSSItem[];
        const excludeSet = new Set(source.exclude ?? []);

        switch (source.show) {
            case "pick": {
                const pickSet = new Set(source.pick ?? []);
                filtered = items.filter((item) =>
                    pickSet.has(getSlugFromUrl(item.link))
                );
                break;
            }
            case "latest":
                filtered = items
                    .filter((item) => !excludeSet.has(getSlugFromUrl(item.link)))
                    .slice(0, source.count ?? 6);
                break;
            case "all":
            default:
                filtered = items.filter(
                    (item) => !excludeSet.has(getSlugFromUrl(item.link))
                );
                break;
        }

        return filtered.map(
            (item): BlogPost => ({
                title: item.title,
                brief: item.description,
                url: item.link,
                coverImage: item.thumbnail,
                platform: "medium",
                date: item.pubDate
                    ? new Date(item.pubDate).toISOString()
                    : new Date().toISOString(),
                tags: item.categories,
            })
        );
    } catch (error) {
        console.error("Failed to fetch Medium RSS:", error);
        return [];
    }
}
