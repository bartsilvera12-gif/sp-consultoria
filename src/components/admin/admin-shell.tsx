"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "./admin-provider";
import { AdminUIProvider } from "./ui";

type NavItem = { label: string; href?: string; icon: string; superadmin?: boolean };
type NavGroup = { title?: string; items: NavItem[] };

const NAV: NavGroup[] = [
  { items: [{ label: "Dashboard", href: "/admin", icon: "dashboard" }] },
  {
    title: "Catálogo",
    items: [
      { label: "Productos", href: "/admin/products", icon: "box" },
      { label: "Categorías", href: "/admin/categories", icon: "tag" },
      { label: "Marcas", href: "/admin/brands", icon: "brand" },
    ],
  },
  {
    title: "Contenido del sitio",
    items: [
      { label: "Secciones", href: "/admin/content", icon: "doc" },
      { label: "Servicios", href: "/admin/services", icon: "wrench" },
      { label: "Navegación", href: "/admin/navigation", icon: "nav" },
      { label: "Páginas", href: "/admin/pages", icon: "page" },
      { label: "Multimedia", href: "/admin/media", icon: "image" },
    ],
  },
  {
    title: "Sistema",
    items: [
      { label: "Configuración", href: "/admin/settings", icon: "gear" },
      { label: "Administradores", href: "/admin/admins", icon: "users", superadmin: true },
    ],
  },
];

function Ico({ name, className }: { name: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    dashboard: (<><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>),
    box: (<><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></>),
    tag: (<><path d="M3 11V5a2 2 0 0 1 2-2h6l9 9-8 8z" /><circle cx="7.5" cy="7.5" r="1.3" /></>),
    brand: (<><circle cx="12" cy="12" r="8" /><path d="M8 12h8M12 8v8" /></>),
    doc: (<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>),
    wrench: (<><path d="M14.5 6a3.5 3.5 0 0 0-4.9 4.2L4 16v4h4l5.8-5.6A3.5 3.5 0 0 0 18 9.5" /></>),
    nav: (<><path d="M4 6h16M4 12h16M4 18h16" /></>),
    page: (<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6M9 11h6M9 15h4" /></>),
    image: (<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.6" /><path d="m4 18 5-5 4 4 3-3 4 4" /></>),
    gear: (<><circle cx="12" cy="12" r="3.2" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" /></>),
    users: (<><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-5-5.9" /></>),
    logout: (<><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" /></>),
    menu: (<><path d="M4 6h16M4 12h16M4 18h16" /></>),
    close: (<><path d="M6 6l12 12M18 6 6 18" /></>),
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {paths[name] ?? paths.doc}
    </svg>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { admin, signOut } = useAdminAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isSuper = admin?.role === "superadmin";

  const Sidebar = (
    <div className="flex h-full flex-col bg-[var(--navy)] text-white">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 text-sm font-bold">SP</span>
        <div className="leading-tight">
          <div className="text-sm font-semibold">Panel Admin</div>
          <div className="text-[11px] text-white/55">SP Consultoría</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map((g, gi) => (
          <div key={gi} className="mb-5">
            {g.title && <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">{g.title}</div>}
            <ul className="space-y-0.5">
              {g.items
                .filter((it) => !it.superadmin || isSuper)
                .map((it) => {
                  const active = it.href && (it.href === "/admin" ? pathname === "/admin" : pathname.startsWith(it.href));
                  return (
                    <li key={it.label}>
                      {it.href ? (
                        <Link
                          href={it.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors",
                            active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/8 hover:text-white",
                          )}
                        >
                          <Ico name={it.icon} className="size-[18px] shrink-0" />
                          {it.label}
                        </Link>
                      ) : null}
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <div className="truncate px-3 pb-2 text-[11px] text-white/50">{admin?.email}</div>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Ico name="logout" className="size-[18px]" /> Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f5f9] text-[var(--navy)]">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{Sidebar}</aside>

      {/* Topbar mobile */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-black/5 bg-white px-4 py-3 lg:hidden">
        <button type="button" aria-label="Menú" onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-lg border border-black/10">
          <Ico name="menu" className="size-5" />
        </button>
        <span className="text-sm font-semibold">Panel Admin</span>
      </header>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">
            <div className="relative h-full">
              <button type="button" aria-label="Cerrar" onClick={() => setOpen(false)} className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-lg bg-white/10 text-white">
                <Ico name="close" className="size-5" />
              </button>
              {Sidebar}
            </div>
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <AdminUIProvider>{children}</AdminUIProvider>
        </div>
      </main>
    </div>
  );
}
