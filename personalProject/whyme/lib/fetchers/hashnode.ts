import type { BlogPost, BlogSource } from "@/types/portfolio";

const HASHNODE_API = "https://gql.hashnode.com";

const POSTS_QUERY = `
  query Publication($host: String!, $first: Int!, $after: String) {
    publication(host: $host) {
      posts(first: $first, after: $after) {
        edges {
          node {
            title
            brief
            slug
            url
            publishedAt
            readTimeInMinutes
            coverImage {
              url
            }
            tags {
              name
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

interface HashnodePost {
    title: string;
    brief: string;
    slug: string;
    url: string;
    publishedAt: string;
    readTimeInMinutes: number;
    coverImage: { url: string } | null;
    tags: { name: string }[];
}

interface HashnodeResponse {
    data: {
        publication: {
            posts: {
                edges: { node: HashnodePost }[];
                pageInfo: { hasNextPage: boolean; endCursor: string };
            };
        } | null;
    };
}

async function fetchAllHashnodePosts(host: string): Promise<HashnodePost[]> {
    const allPosts: HashnodePost[] = [];
    let hasNextPage = true;
    let after: string | null = null;

    while (hasNextPage) {
        const res = await fetch(HASHNODE_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: POSTS_QUERY,
                variables: { host, first: 20, after },
            }),
            next: { revalidate: 3600 }, // revalidate every hour
        });

        if (!res.ok) {
            console.error(`Hashnode API error: ${res.status}`);
            break;
        }

        const json: HashnodeResponse = await res.json();
        const publication = json.data?.publication;
        if (!publication) {
            console.error(`Hashnode publication not found for host: ${host}`);
            break;
        }

        const edges = publication.posts.edges;
        allPosts.push(...edges.map((e) => e.node));

        hasNextPage = publication.posts.pageInfo.hasNextPage;
        after = publication.posts.pageInfo.endCursor;
    }

    return allPosts;
}

function toUnifiedPost(post: HashnodePost): BlogPost {
    return {
        title: post.title,
        brief: post.brief,
        url: post.url,
        coverImage: post.coverImage?.url,
        platform: "hashnode",
        date: post.publishedAt,
        readTime: post.readTimeInMinutes,
        tags: post.tags.map((t) => t.name),
    };
}

export async function fetchHashnodePosts(
    source: BlogSource
): Promise<BlogPost[]> {
    const allPosts = await fetchAllHashnodePosts(source.host);
    let filtered: HashnodePost[];

    switch (source.show) {
        case "pick":
            // Only include posts matching the pick slugs
            const pickSet = new Set(source.pick ?? []);
            filtered = allPosts.filter((p) => pickSet.has(p.slug));
            break;

        case "latest":
            // Take the most recent N posts (already sorted by date from API)
            const excludeSet = new Set(source.exclude ?? []);
            filtered = allPosts
                .filter((p) => !excludeSet.has(p.slug))
                .slice(0, source.count ?? 6);
            break;

        case "all":
        default:
            const exSet = new Set(source.exclude ?? []);
            filtered = allPosts.filter((p) => !exSet.has(p.slug));
            break;
    }

    return filtered.map(toUnifiedPost);
}
