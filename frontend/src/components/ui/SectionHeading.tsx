import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  kicker: string;
  title: string;
  align?: "left" | "center";
  className?: string;
}

// Shared editorial heading pattern (kicker + serif title) used across
// every section to keep the visual hierarchy consistent site-wide.
export default function SectionHeading({ kicker, title, align = "left", className }: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" ? "text-center" : "text-left", className)}>
      <p
        className="font-[family-name:var(--font-sans)] text-xs font-semibold tracking-[0.2em] uppercase mb-3"
        style={{ color: "var(--noir-accent)" }}
      >
        {kicker}
      </p>
      <h2
        className="font-[family-name:var(--font-serif)] italic font-normal text-4xl md:text-5xl tracking-tight"
        style={{ color: "var(--noir-fg)" }}
      >
        {title}
      </h2>
    </div>
  );
}
