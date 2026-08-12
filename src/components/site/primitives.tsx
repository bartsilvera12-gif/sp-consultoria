import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  light = false,
  className,
}: {
  children: React.ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight", light ? "text-white/85" : "text-[var(--navy-2)]", className)}>
      <span className={cn("h-px w-7", light ? "bg-white/60" : "bg-[var(--navy-2)]/55")} />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  className,
  light = false,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={className}>
      {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
      <h2 className={cn("section-title mt-4 text-3xl sm:text-4xl md:text-[2.75rem]", light && "!text-white")}>{title}</h2>
    </div>
  );
}

export function Section({
  id,
  className,
  children,
  tone = "white",
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  tone?: "white" | "muted" | "navy";
}) {
  const bg =
    tone === "muted" ? "bg-[var(--muted)]" : tone === "navy" ? "bg-[var(--navy)] text-white" : "bg-white";
  return (
    <section id={id} className={cn("scroll-mt-24 px-5 sm:px-8", bg, className)}>
      <div className="mx-auto max-w-[74rem] py-20 sm:py-24 md:py-28">{children}</div>
    </section>
  );
}
