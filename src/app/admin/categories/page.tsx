"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/supabase/client";
import { logAudit } from "@/lib/supabase/auth";
import { useAdminAuth } from "@/components/admin/admin-provider";
import {
  PageHeader, Btn, Card, Modal, Field, TextInput, Toggle, Badge,
  Loading, EmptyState, ErrorState, Icon, useUI,
} from "@/components/admin/ui";
import type { ProductCategory } from "@/lib/supabase/types";

type Draft = Partial<ProductCategory>;
const EMPTY: Draft = { key: "", name_es: "", name_en: "", icon: "", sort_order: 0, active: true };

export default function CategoriesPage() {
  const { userId } = useAdminAuth();
  const { toast, confirm } = useUI();
  const [rows, setRows] = useState<ProductCategory[] | null>(null);
  const [err, setErr] = useState(false);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await db().from("product_categories").select("*").order("sort_order");
    if (error) { setErr(true); return; }
    setRows((data as ProductCategory[]) ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing?.name_es?.trim() || !editing?.key?.trim()) {
      toast("Completá la clave y el nombre en español.", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        key: editing.key!.trim(),
        name_es: editing.name_es!.trim(),
        name_en: editing.name_en?.trim() || editing.name_es!.trim(),
        icon: editing.icon?.trim() || null,
        sort_order: Number(editing.sort_order) || 0,
        active: editing.active ?? true,
      };
      if (editing.id) {
        const { error } = await db().from("product_categories").update(payload).eq("id", editing.id);
        if (error) throw error;
        await logAudit(userId!, "update", "product_category", editing.id);
        toast("Categoría actualizada.");
      } else {
        const { data, error } = await db().from("product_categories").insert(payload).select("id").single();
        if (error) throw error;
        await logAudit(userId!, "create", "product_category", (data as { id: string })?.id);
        toast("Categoría creada.");
      }
      setEditing(null);
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "No se pudo guardar.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: ProductCategory) {
    const ok = await confirm({ title: "Eliminar categoría", message: `"${c.name_es}". Los productos quedarán sin categoría.`, confirmLabel: "Eliminar", danger: true });
    if (!ok) return;
    const { error } = await db().from("product_categories").delete().eq("id", c.id);
    if (error) { toast(error.message, "error"); return; }
    await logAudit(userId!, "delete", "product_category", c.id);
    toast("Categoría eliminada.");
    load();
  }

  return (
    <div>
      <PageHeader title="Categorías" subtitle="Grupos de productos del catálogo.">
        <Btn icon="plus" onClick={() => setEditing({ ...EMPTY, sort_order: (rows?.length ?? 0) + 1 })}>Nueva categoría</Btn>
      </PageHeader>

      {err ? <ErrorState /> : rows === null ? <Loading /> : rows.length === 0 ? (
        <EmptyState icon="tag" title="Sin categorías" message="Creá la primera categoría para organizar tus productos."
          action={<Btn icon="plus" onClick={() => setEditing({ ...EMPTY, sort_order: 1 })}>Nueva categoría</Btn>} />
      ) : (
        <Card className="!p-0 overflow-hidden">
          <ul className="divide-y divide-black/5">
            {rows.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--navy)]/5 text-[var(--navy)]">
                  <Icon name="tag" className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[14px] font-semibold text-[var(--navy)]">{c.name_es}</span>
                    <Badge active={c.active} />
                  </div>
                  <div className="text-[12px] text-muted-foreground">{c.name_en} · <code>{c.key}</code></div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Btn variant="ghost" size="sm" icon="edit" onClick={() => setEditing(c)}>Editar</Btn>
                  <Btn variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => remove(c)}><Icon name="trash" className="size-4" /></Btn>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Editar categoría" : "Nueva categoría"}>
        {editing && (
          <div className="space-y-4">
            <Field label="Clave" hint="única, sin espacios" help="Identificador interno, ej: camaras, alarmas.">
              <TextInput value={editing.key ?? ""} onChange={(e) => setEditing({ ...editing, key: e.target.value })} placeholder="camaras" />
            </Field>
            <Field label="Nombre" lang="ES">
              <TextInput value={editing.name_es ?? ""} onChange={(e) => setEditing({ ...editing, name_es: e.target.value })} placeholder="Cámaras de seguridad" />
            </Field>
            <Field label="Nombre" lang="EN">
              <TextInput value={editing.name_en ?? ""} onChange={(e) => setEditing({ ...editing, name_en: e.target.value })} placeholder="Security cameras" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ícono" hint="opcional"><TextInput value={editing.icon ?? ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="camera" /></Field>
              <Field label="Orden"><TextInput type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
            </div>
            <Toggle checked={editing.active ?? true} onChange={(v) => setEditing({ ...editing, active: v })} label="Visible en el sitio" />
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
