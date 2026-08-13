import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

export function SectionDivider({ light = false }: { light?: boolean }) {
  return (
    <div aria-hidden className="mx-auto flex max-w-[74rem] items-center gap-4">
      <span className={cn("h-px flex-1 bg-gradient-to-r from-transparent", light ? "to-white/35" : "to-[var(--navy-2)]/30")} />
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full border shadow-sm",
          light ? "border-white/30 bg-white/10 text-white" : "border-[var(--navy-2)]/15 bg-white text-[var(--navy-2)]",
        )}
      >
        <ShieldCheck className="size-4" strokeWidth={1.7} />
      </span>
      <span className={cn("h-px flex-1 bg-gradient-to-l from-transparent", light ? "to-white/35" : "to-[var(--navy-2)]/30")} />
    </div>
  );
}

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
  divider = true,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  tone?: "white" | "muted" | "navy";
  divider?: boolean;
}) {
  const isNavy = tone === "navy";
  const bg =
    tone === "muted"
      ? "bg-gradient-to-b from-[#e8f2ea] to-[#f2f8f3]"
      : isNavy
        ? "bg-[var(--navy)] text-white"
        : "bg-gradient-to-b from-white to-[#f5faf6]";
  return (
    <section id={id} className={cn("relative isolate scroll-mt-24 px-5 sm:px-8", bg, className)}>
      {!isNavy && (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-40 -top-24 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(29,113,49,0.13),transparent_68%)]" />
          <div className="absolute -bottom-32 -right-44 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(19,39,26,0.08),transparent_70%)]" />
        </div>
      )}
      {divider && (
        <div className="absolute inset-x-5 top-0 z-10 -translate-y-1/2 sm:inset-x-8">
          <SectionDivider light={isNavy} />
        </div>
      )}
      <div className="relative mx-auto max-w-[74rem] py-20 sm:py-24 md:py-28">{children}</div>
    </section>
  );
}
