"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/supabase/client";
import { logAudit } from "@/lib/supabase/auth";
import { useAdminAuth } from "@/components/admin/admin-provider";
import {
  PageHeader, Btn, Card, Modal, Field, TextInput, Toggle, Badge,
  Loading, EmptyState, ErrorState, Icon, useUI,
} from "@/components/admin/ui";
import type { NavigationItem } from "@/lib/supabase/types";

type Draft = Partial<NavigationItem>;

export default function NavigationPage() {
  const { userId } = useAdminAuth();
  const { toast, confirm } = useUI();
  const [rows, setRows] = useState<NavigationItem[] | null>(null);
  const [err, setErr] = useState(false);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await db().from("navigation_items").select("*").order("sort_order");
    if (error) { setErr(true); return; }
    setRows((data as NavigationItem[]) ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing?.label_es?.trim() || !editing?.href?.trim()) { toast("Completá la etiqueta y el enlace.", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        label_es: editing.label_es!.trim(),
        label_en: editing.label_en?.trim() || editing.label_es!.trim(),
        href: editing.href!.trim(),
        sort_order: Number(editing.sort_order) || 0,
        active: editing.active ?? true,
      };
      if (editing.id) {
        const { error } = await db().from("navigation_items").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await db().from("navigation_items").insert(payload);
        if (error) throw error;
      }
      await logAudit(userId!, editing.id ? "update" : "create", "navigation_item", editing.id);
      toast("Guardado.");
      setEditing(null);
      await load();
    } catch (e) { toast(e instanceof Error ? e.message : "No se pudo guardar.", "error"); }
    finally { setSaving(false); }
  }

  async function remove(n: NavigationItem) {
    const ok = await confirm({ title: "Eliminar elemento", message: `"${n.label_es}".`, confirmLabel: "Eliminar", danger: true });
    if (!ok) return;
    const { error } = await db().from("navigation_items").delete().eq("id", n.id);
    if (error) { toast(error.message, "error"); return; }
    await logAudit(userId!, "delete", "navigation_item", n.id);
    load();
  }

  async function move(i: number, dir: -1 | 1) {
    if (!rows) return;
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const a = rows[i], b = rows[j];
    // Swap optimista en UI
    const next = [...rows];
    next[i] = b; next[j] = a;
    setRows(next);
    await Promise.all([
      db().from("navigation_items").update({ sort_order: b.sort_order }).eq("id", a.id),
      db().from("navigation_items").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
  }

  return (
    <div>
      <PageHeader title="Navegación" subtitle="Enlaces del menú principal del sitio.">
        <Btn icon="plus" onClick={() => setEditing({ label_es: "", label_en: "", href: "#", sort_order: (rows?.length ?? 0) + 1, active: true })}>Nuevo enlace</Btn>
      </PageHeader>

      {err ? <ErrorState /> : rows === null ? <Loading /> : rows.length === 0 ? (
        <EmptyState icon="nav" title="Sin enlaces"
          action={<Btn icon="plus" onClick={() => setEditing({ label_es: "", label_en: "", href: "#", sort_order: 1, active: true })}>Nuevo enlace</Btn>} />
      ) : (
        <Card className="!p-0 overflow-hidden">
          <ul className="divide-y divide-black/5">
            {rows.map((n, i) => (
              <li key={n.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <div className="flex shrink-0 flex-col">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="grid size-5 place-items-center text-muted-foreground hover:text-[var(--navy)] disabled:opacity-25"><Icon name="up" className="size-4" /></button>
                  <button onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="grid size-5 place-items-center text-muted-foreground hover:text-[var(--navy)] disabled:opacity-25"><Icon name="down" className="size-4" /></button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[14px] font-semibold text-[var(--navy)]">{n.label_es}</span>
                    <Badge active={n.active} />
                  </div>
                  <div className="truncate text-[12px] text-muted-foreground">{n.label_en} · <code>{n.href}</code></div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Btn variant="ghost" size="sm" icon="edit" onClick={() => setEditing(n)}>Editar</Btn>
                  <Btn variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => remove(n)}><Icon name="trash" className="size-4" /></Btn>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Editar enlace" : "Nuevo enlace"}>
        {editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Etiqueta" lang="ES"><TextInput value={editing.label_es ?? ""} onChange={(e) => setEditing({ ...editing, label_es: e.target.value })} placeholder="Inicio" /></Field>
              <Field label="Etiqueta" lang="EN"><TextInput value={editing.label_en ?? ""} onChange={(e) => setEditing({ ...editing, label_en: e.target.value })} placeholder="Home" /></Field>
            </div>
            <Field label="Enlace" help="Interno (#seccion) o URL completa."><TextInput value={editing.href ?? ""} onChange={(e) => setEditing({ ...editing, href: e.target.value })} placeholder="#servicios" /></Field>
            <Toggle checked={editing.active ?? true} onChange={(v) => setEditing({ ...editing, active: v })} label="Visible en el menú" />
            <div className="flex justify-end gap-2.5 pt-1">
              <Btn variant="secondary" onClick={() => setEditing(null)}>Cancelar</Btn>
              <Btn loading={saving} onClick={save}>Guardar</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
