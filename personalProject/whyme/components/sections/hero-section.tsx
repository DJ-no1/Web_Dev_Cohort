import Image from "next/image";
import type { Hero, Social } from "@/types/portfolio";
import { SocialIcons } from "@/components/social-icons";

function getImageUrl(image: Hero["image"]): string | null {
  if (!image) return null;
  if (image.source === "github") {
    return `https://github.com/${image.value}.png`;
  }
  return image.value;
}

export function HeroSection({
  hero,
  socials,
}: {
  hero: Hero;
  socials: Social[];
}) {
  const avatarUrl = getImageUrl(hero.image);

  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      {/* Subtle radial glow behind content */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-white/[0.02] blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {avatarUrl && (
          <div className="mb-8 overflow-hidden rounded-full border-2 border-white/10 shadow-2xl shadow-white/5 transition-transform duration-500 hover:scale-105">
            <Image
              src={avatarUrl}
              alt={hero.name}
              width={140}
              height={140}
              className="h-[140px] w-[140px] object-cover"
              priority
            />
          </div>
        )}
        <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          {hero.name}
        </h1>
        <p className="mt-5 max-w-2xl text-lg font-medium text-muted-foreground sm:text-xl md:text-2xl">
          {hero.tagline}
        </p>
        {hero.description && (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground/70 sm:text-base">
            {hero.description}
          </p>
        )}
        <div className="mt-10">
          <SocialIcons socials={socials} />
        </div>
      </div>
    </section>
  );
}
