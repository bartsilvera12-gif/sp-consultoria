"use client";

// Piezas de UI compartidas del panel admin: toasts, confirmación,
// cabecera de página, botones, campos de formulario y estados (carga/vacío/error).

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Iconos inline (lucide-react trae un set reducido, usamos SVG propios) */
/* ------------------------------------------------------------------ */

export function Icon({ name, className }: { name: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    plus: <path d="M12 5v14M5 12h14" />,
    check: <path d="M20 6 9 17l-5-5" />,
    x: <path d="M6 6l12 12M18 6 6 18" />,
    edit: (<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>),
    trash: (<><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" /></>),
    back: <path d="M19 12H5M12 19l-7-7 7-7" />,
    search: (<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>),
    warn: (<><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></>),
    up: <path d="m18 15-6-6-6 6" />,
    down: <path d="m6 9 6 6 6-6" />,
    image: (<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.6" /><path d="m4 18 5-5 4 4 3-3 4 4" /></>),
    box: (<><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></>),
    external: (<><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>),
    copy: (<><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>),
    tag: (<><path d="M3 11V5a2 2 0 0 1 2-2h6l9 9-8 8z" /><circle cx="7.5" cy="7.5" r="1.3" /></>),
    brand: (<><circle cx="12" cy="12" r="8" /><path d="M8 12h8M12 8v8" /></>),
    nav: <path d="M4 6h16M4 12h16M4 18h16" />,
    wrench: <path d="M14.5 6a3.5 3.5 0 0 0-4.9 4.2L4 16v4h4l5.8-5.6A3.5 3.5 0 0 0 18 9.5" />,
    page: (<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 11h6M9 15h4" /></>),
    doc: (<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>),
    users: (<><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-5-5.9" /></>),
    gear: (<><circle cx="12" cy="12" r="3.2" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" /></>),
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {paths[name] ?? null}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Provider combinado: Toasts + Confirmación                           */
/* ------------------------------------------------------------------ */

type Toast = { id: number; kind: "success" | "error" | "info"; msg: string };
type ConfirmOpts = { title: string; message?: string; confirmLabel?: string; danger?: boolean };

type UICtx = {
  toast: (msg: string, kind?: Toast["kind"]) => void;
  confirm: (opts: ConfirmOpts) => Promise<boolean>;
};

const Ctx = createContext<UICtx | null>(null);

export function AdminUIProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const seq = useRef(0);

  const toast = useCallback((msg: string, kind: Toast["kind"] = "success") => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, kind, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const confirm = useCallback((opts: ConfirmOpts) => {
    return new Promise<boolean>((resolve) => setDialog({ ...opts, resolve }));
  }, []);

  const close = (v: boolean) => {
    dialog?.resolve(v);
    setDialog(null);
  };

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <Ctx.Provider value={value}>
      {children}

      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg",
              t.kind === "success" && "bg-emerald-600",
              t.kind === "error" && "bg-red-600",
              t.kind === "info" && "bg-[var(--navy)]",
            )}
          >
            <Icon name={t.kind === "error" ? "warn" : "check"} className="size-4 shrink-0" />
            {t.msg}
          </div>
        ))}
      </div>

      {/* Diálogo de confirmación */}
      {dialog && (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => close(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", dialog.danger ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600")}>
                <Icon name="warn" className="size-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-[var(--navy)]">{dialog.title}</h3>
                {dialog.message && <p className="mt-1 text-sm text-muted-foreground">{dialog.message}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2.5">
              <button onClick={() => close(false)} className="rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold text-[var(--navy)] transition-colors hover:bg-black/5">
                Cancelar
              </button>
              <button
                onClick={() => close(true)}
                className={cn("rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors", dialog.danger ? "bg-red-600 hover:bg-red-700" : "bg-[var(--navy)] hover:bg-[var(--navy-2)]")}
              >
                {dialog.confirmLabel ?? "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useUI() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUI debe usarse dentro de <AdminUIProvider>");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Cabecera de página                                                  */
/* ------------------------------------------------------------------ */

export function PageHeader({
  title,
  subtitle,
  backHref,
  children,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {backHref && (
          <Link href={backHref} className="mb-1.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-[var(--navy)]">
            <Icon name="back" className="size-4" /> Volver
          </Link>
        )}
        <h1 className="text-2xl font-bold text-[var(--navy)]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Botones                                                             */
/* ------------------------------------------------------------------ */

type BtnProps = {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  loading?: boolean;
  icon?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Btn({ variant = "primary", size = "md", loading, icon, className, children, disabled, ...rest }: BtnProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:opacity-60",
        size === "sm" ? "px-3 py-1.5 text-[13px]" : "px-4 py-2.5 text-sm",
        variant === "primary" && "bg-[var(--navy)] text-white hover:bg-[var(--navy-2)]",
        variant === "secondary" && "border border-black/10 bg-white text-[var(--navy)] hover:bg-black/5",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        variant === "ghost" && "text-[var(--navy)] hover:bg-black/5",
        className,
      )}
      {...rest}
    >
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-60" />}
      {!loading && icon && <Icon name={icon} className="size-4" />}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Campos de formulario                                                */
/* ------------------------------------------------------------------ */

const fieldCls =
  "w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--navy-2)] focus:ring-2 focus:ring-[var(--navy-2)]/20 disabled:bg-black/5 disabled:text-muted-foreground";

export function Label({ children, hint, htmlFor }: { children: React.ReactNode; hint?: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-[var(--navy)]">
      {children}
      {hint && <span className="text-[11px] font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Field({
  label,
  hint,
  lang,
  help,
  children,
}: {
  label: string;
  hint?: string;
  lang?: "ES" | "EN";
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label hint={hint}>
        {label}
        {lang && (
          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", lang === "ES" ? "bg-[var(--navy)]/10 text-[var(--navy)]" : "bg-amber-100 text-amber-700")}>
            {lang}
          </span>
        )}
      </Label>
      {children}
      {help && <p className="mt-1 text-[11px] text-muted-foreground">{help}</p>}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldCls, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(fieldCls, "min-h-[90px] resize-y", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(fieldCls, "cursor-pointer", props.className)} />;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-black/10 bg-white px-4 py-3">
      <span className="min-w-0">
        <span className="block text-[13.5px] font-semibold text-[var(--navy)]">{label}</span>
        {description && <span className="block text-[11.5px] text-muted-foreground">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-[var(--navy)]" : "bg-black/15")}
      >
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </button>
    </label>
  );
}

/* Panel/card contenedor */
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6", className)}>{children}</div>;
}

/* Modal centrado (para editores en línea) */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-start justify-center p-4 sm:items-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className={cn("relative w-full rounded-2xl bg-white shadow-xl", wide ? "max-w-2xl" : "max-w-md")}>
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
            <h3 className="text-base font-bold text-[var(--navy)]">{title}</h3>
            <button onClick={onClose} aria-label="Cerrar" className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-black/5">
              <Icon name="x" className="size-5" />
            </button>
          </div>
          <div className="px-5 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Estados: carga / vacío / error                                      */
/* ------------------------------------------------------------------ */

export function Spinner({ className }: { className?: string }) {
  return <span className={cn("inline-block animate-spin rounded-full border-2 border-[var(--navy)]/20 border-t-[var(--navy)]", className)} />;
}

export function Loading({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="grid place-items-center py-20">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Spinner className="size-7" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  message,
  icon = "box",
  action,
}: {
  title: string;
  message?: string;
  icon?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-black/10 bg-white/50 px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-[var(--navy)]/5 text-[var(--navy)]">
        <Icon name={icon} className="size-7" />
      </span>
      <h3 className="mt-4 text-base font-bold text-[var(--navy)]">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
      {message ?? "No se pudieron cargar los datos."} Verificá que el schema <code>spconsultoriaweb</code> esté expuesto en la Data API de Supabase.
    </div>
  );
}

export function Badge({ active, labels }: { active: boolean; labels?: [string, string] }) {
  const [on, off] = labels ?? ["Activo", "Inactivo"];
  return (
    <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold", active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500")}>
      {active ? on : off}
    </span>
  );
}
