# WhyMe

A minimal, black & white portfolio showcase. Clone. Edit one JSON file. Deploy.

> "Why follow me? Why connect with me? Why choose me?" — Give them the answer.

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/your-username/whyme.git
cd whyme

# 2. Install dependencies
pnpm install

# 3. Edit your data
# Open data/portfolio.json and fill in your info

# 4. Run locally
pnpm dev

# 5. Deploy to Vercel
# Push to GitHub → Import on vercel.com → Done
```

## How It Works

Everything on the page is driven by a single file: **`data/portfolio.json`**

- **Hero** — your name, tagline, and optional description
- **Socials** — only platforms you add show up (GitHub, LinkedIn, X, Hashnode, YouTube)
- **Sections** — appear in whatever order you put them in the JSON array

### Section Types

| Type          | What it shows                                                                     |
| ------------- | --------------------------------------------------------------------------------- |
| `blogs`       | Auto-fetches from Hashnode (GraphQL API) and/or Medium (RSS), plus manual entries |
| `projects`    | Project cards with description, tech stack badges, live + GitHub links            |
| `videos`      | Video cards with auto-generated YouTube thumbnails                                |
| `assignments` | Assignment cards with description, tech stack, and link                           |

### Blog Auto-Fetch

You can auto-fetch blog posts from **Hashnode** and **Medium** by configuring sources in the JSON:

```json
{
  "type": "blogs",
  "title": "Blogs",
  "config": {
    "sources": [
      {
        "platform": "hashnode",
        "host": "yourdomain.hashnode.dev",
        "show": "latest",
        "count": 6,
        "exclude": ["slug-to-hide"]
      },
      {
        "platform": "medium",
        "host": "@yourusername",
        "show": "all"
      }
    ],
    "manual": [
      {
        "title": "My Custom Blog Post",
        "description": "A manually added blog entry",
        "url": "https://example.com/post",
        "platform": "other",
        "date": "2025-01-01"
      }
    ]
  }
}
```

**Show modes:**

- `"all"` — fetch & display every post
- `"latest"` + `"count"` — show the N most recent posts
- `"pick"` + `"pick": ["slug1", "slug2"]` — show only specific posts by slug
- `"exclude": ["slug"]` — hide specific posts from all/latest modes

> **Note:** Medium RSS feeds return only ~10 most recent posts (Medium limitation).

### Full JSON Schema

```json
{
  "hero": {
    "name": "Your Name",
    "tagline": "Your one-liner tagline",
    "description": "Optional longer description"
  },
  "socials": [
    { "platform": "github", "url": "https://github.com/you" },
    { "platform": "linkedin", "url": "https://linkedin.com/in/you" },
    { "platform": "twitter", "url": "https://x.com/you" },
    { "platform": "hashnode", "url": "https://you.hashnode.dev" },
    { "platform": "youtube", "url": "https://youtube.com/@you" }
  ],
  "sections": [
    {
      "type": "blogs",
      "title": "Blogs",
      "config": { "sources": [], "manual": [] }
    },
    {
      "type": "projects",
      "title": "Projects",
      "items": [
        {
          "title": "Project Name",
          "description": "What it does",
          "url": "https://live-url.com",
          "tech": ["Next.js", "TypeScript"],
          "github": "https://github.com/you/repo"
        }
      ]
    },
    {
      "type": "videos",
      "title": "Videos",
      "items": [
        {
          "title": "Video Title",
          "url": "https://youtube.com/watch?v=...",
          "platform": "youtube",
          "description": "What this video covers"
        }
      ]
    },
    {
      "type": "assignments",
      "title": "Assignments",
      "items": [
        {
          "title": "Week 1 — Topic",
          "description": "What you built or learned",
          "url": "https://github.com/you/repo/tree/main/week-1",
          "tech": ["HTML", "CSS"]
        }
      ]
    }
  ]
}
```

### Section Ordering

Sections render in the **exact order** they appear in the `sections` array. Move them around to change the page layout — no code changes needed.

## Tech Stack

- [Next.js](https://nextjs.org) — React framework with SSG
- [Tailwind CSS v4](https://tailwindcss.com) — Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com) — Accessible components
- [Lucide](https://lucide.dev) — Icons
- [Geist](https://vercel.com/font) — Typography

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/whyme)

## License

MIT
