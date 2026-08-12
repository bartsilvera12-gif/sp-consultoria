import { cn } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="h-px w-8 bg-gradient-to-r from-primary/70 to-[var(--silver)]/40" />
      <span className="eyebrow">{children}</span>
    </div>
  );
}

export function Divider() {
  return (
    <div className="relative mx-auto h-px w-full max-w-[76rem]">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[1px] bg-gradient-to-br from-[var(--silver)] to-primary/80" />
    </div>
  );
}

export function Section({
  id,
  className,
  children,
  divider = true,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 px-5 sm:px-8", className)}>
      {divider && (
        <div className="mx-auto max-w-[76rem]">
          <Divider />
        </div>
      )}
      <div className="mx-auto max-w-[76rem] py-20 sm:py-28">{children}</div>
    </section>
  );
}
