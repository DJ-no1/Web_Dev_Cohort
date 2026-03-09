import { Github, Linkedin, Twitter, Youtube } from "lucide-react";
import type { Social } from "@/types/portfolio";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube,
};

// Hashnode doesn't have a lucide icon — use custom SVG
function HashnodeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 337 337"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23.155 112.598c-30.873 30.874-30.873 80.93 0 111.804l89.443 89.443c30.874 30.873 80.93 30.873 111.804 0l89.443-89.443c30.873-30.874 30.873-80.93 0-111.804l-89.443-89.443c-30.874-30.873-80.93-30.873-111.804 0l-89.443 89.443zm136.97 103.926c26.842 0 48.6-21.758 48.6-48.6s-21.758-48.6-48.6-48.6-48.6 21.758-48.6 48.6 21.758 48.6 48.6 48.6z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SocialIcons({ socials }: { socials: Social[] }) {
  if (!socials || socials.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      {socials.map((social) => {
        const platform = social.platform.toLowerCase();
        const Icon =
          platform === "hashnode" ? HashnodeIcon : ICON_MAP[platform];

        if (!Icon) return null;

        return (
          <a
            key={social.platform}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-muted-foreground transition-all duration-300 hover:bg-white/[0.06] hover:text-foreground"
            aria-label={social.platform}
          >
            <Icon className="h-5 w-5" />
          </a>
        );
      })}
    </div>
  );
}
