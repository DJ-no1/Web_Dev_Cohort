import { Separator } from "@/components/ui/separator";

export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-10">
      <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h2>
      <Separator className="mt-4 bg-white/[0.08]" />
    </div>
  );
}
