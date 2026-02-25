import { cn } from "@/lib/utils";

export function SectionTitle({
  title,
  accent = false,
  align = "center",
  showLabel = true
}: {
  title: string;
  accent?: boolean;
  align?: "left" | "center";
  showLabel?: boolean;
}) {
  return (
    <div className={cn("mb-8 sm:mb-10", align === "center" ? "text-center" : "text-left")}>
      {showLabel ? (
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
            accent
              ? "border-brand-accent/30 text-brand-accent"
              : "border-brand-primary/30 text-brand-primary"
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          BOND
        </div>
      ) : null}
      <h2
        className={cn(
          "text-2xl sm:text-3xl md:text-5xl font-display font-semibold tracking-tight",
          showLabel ? "mt-4" : "mt-0",
          accent ? "text-brand-accent" : "text-brand-primary"
        )}
      >
        {title}
      </h2>
      <div
        className={cn(
          "mt-4 h-1.5 w-20 rounded-full",
          align === "center" ? "mx-auto" : "",
          accent ? "bg-brand-accent" : "bg-brand-primary"
        )}
      />
    </div>
  );
}
