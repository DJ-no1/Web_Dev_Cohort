import { SocialIcons } from "@/components/social-icons";
import { Separator } from "@/components/ui/separator";
import type { Social } from "@/types/portfolio";

export function Footer({ socials }: { socials: Social[] }) {
  return (
    <footer className="px-6 pb-16 pt-20">
      <div className="mx-auto max-w-5xl">
        <Separator className="mb-10 bg-white/[0.06]" />
        <div className="flex flex-col items-center gap-5 text-center">
          <SocialIcons socials={socials} />
          <p className="text-xs tracking-wide text-muted-foreground/60">
            Built with{" "}
            <a
              href="https://github.com/anands/whyme"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/80 underline underline-offset-4 transition-colors duration-300 hover:text-foreground"
            >
              WhyMe
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
