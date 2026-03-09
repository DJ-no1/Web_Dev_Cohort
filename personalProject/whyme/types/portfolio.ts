// ── Hero ─────────────────────────────────────────────────────
export interface HeroImage {
    /** "github" = fetch avatar from GitHub username, "manual" = direct URL */
    source: "github" | "manual";
    /** GitHub username (when source = "github") or direct image URL (when source = "manual") */
    value: string;
}

export interface Hero {
    name: string;
    tagline: string;
    description?: string;
    image?: HeroImage;
}

// ── Socials ──────────────────────────────────────────────────
export interface Social {
    platform: string;
    url: string;
}

// ── Blog Section ─────────────────────────────────────────────
export interface BlogSource {
    platform: "hashnode" | "medium";
    /** Hashnode: e.g. "anands.hashnode.dev" | Medium: e.g. "@anand" */
    host: string;
    /** "all" = every post, "latest" = most recent N, "pick" = specific slugs */
    show: "all" | "latest" | "pick";
    /** Number of posts when show = "latest" */
    count?: number;
    /** Slugs to include when show = "pick" */
    pick?: string[];
    /** Slugs to exclude from "all" or "latest" */
    exclude?: string[];
}

export interface ManualBlogEntry {
    title: string;
    description?: string;
    url: string;
    coverImage?: string;
    platform?: string;
    date?: string;
}

export interface BlogConfig {
    sources?: BlogSource[];
    manual?: ManualBlogEntry[];
}

// ── Fetched blog post (unified shape) ────────────────────────
export interface BlogPost {
    title: string;
    brief: string;
    url: string;
    coverImage?: string;
    platform: string;
    date: string;
    readTime?: number;
    tags?: string[];
}

// ── Video Section ────────────────────────────────────────────
export interface VideoItem {
    title: string;
    url: string;
    platform?: string;
    thumbnail?: string;
    description?: string;
}

// ── Project Section ──────────────────────────────────────────
export interface ProjectItem {
    title: string;
    description: string;
    url: string;
    tech?: string[];
    github?: string;
}

// ── Assignment Section ───────────────────────────────────────
export interface AssignmentItem {
    title: string;
    description?: string;
    url: string;
    tech?: string[];
}

// ── Achievement Section ──────────────────────────────────────
export interface AchievementItem {
    title: string;
    description?: string;
    date?: string;
    url?: string;
    issuer?: string;
}

// ── Dynamic section union ────────────────────────────────────
export interface BlogSection {
    type: "blogs";
    title: string;
    config: BlogConfig;
}

export interface VideoSection {
    type: "videos";
    title: string;
    items: VideoItem[];
}

export interface ProjectSection {
    type: "projects";
    title: string;
    items: ProjectItem[];
}

export interface AssignmentSection {
    type: "assignments";
    title: string;
    items: AssignmentItem[];
}

export interface AchievementSection {
    type: "achievements";
    title: string;
    items: AchievementItem[];
}

export type Section =
    | BlogSection
    | VideoSection
    | ProjectSection
    | AssignmentSection
    | AchievementSection;

// ── Root portfolio data ──────────────────────────────────────
export interface Portfolio {
    hero: Hero;
    socials: Social[];
    sections: Section[];
}
