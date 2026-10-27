"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/supabase/client";
import { logAudit } from "@/lib/supabase/auth";
import { useAdminAuth } from "@/components/admin/admin-provider";
import {
  PageHeader, Btn, Card, Modal, Field, TextInput, Toggle, Badge,
  Loading, EmptyState, ErrorState, Icon, useUI,
} from "@/components/admin/ui";
import type { ProductBrand } from "@/lib/supabase/types";

type Draft = Partial<ProductBrand>;

export default function BrandsPage() {
  const { userId } = useAdminAuth();
  const { toast, confirm } = useUI();
  const [rows, setRows] = useState<ProductBrand[] | null>(null);
  const [err, setErr] = useState(false);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await db().from("product_brands").select("*").order("name");
    if (error) { setErr(true); return; }
    setRows((data as ProductBrand[]) ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing?.name?.trim()) { toast("Ingresá el nombre de la marca.", "error"); return; }
    setSaving(true);
    try {
      const payload = { name: editing.name!.trim(), active: editing.active ?? true };
      if (editing.id) {
        const { error } = await db().from("product_brands").update(payload).eq("id", editing.id);
        if (error) throw error;
        await logAudit(userId!, "update", "product_brand", editing.id);
        toast("Marca actualizada.");
      } else {
        const { data, error } = await db().from("product_brands").insert(payload).select("id").single();
        if (error) throw error;
        await logAudit(userId!, "create", "product_brand", (data as { id: string })?.id);
        toast("Marca creada.");
      }
      setEditing(null);
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "No se pudo guardar.", "error");
    } finally { setSaving(false); }
  }

  async function remove(b: ProductBrand) {
    const ok = await confirm({ title: "Eliminar marca", message: `"${b.name}". Los productos quedarán sin marca.`, confirmLabel: "Eliminar", danger: true });
    if (!ok) return;
    const { error } = await db().from("product_brands").delete().eq("id", b.id);
    if (error) { toast(error.message, "error"); return; }
    await logAudit(userId!, "delete", "product_brand", b.id);
    toast("Marca eliminada.");
    load();
  }

  return (
    <div>
      <PageHeader title="Marcas" subtitle="Fabricantes de los productos.">
        <Btn icon="plus" onClick={() => setEditing({ name: "", active: true })}>Nueva marca</Btn>
      </PageHeader>

      {err ? <ErrorState /> : rows === null ? <Loading /> : rows.length === 0 ? (
        <EmptyState icon="brand" title="Sin marcas" message="Agregá las marcas que vendés."
          action={<Btn icon="plus" onClick={() => setEditing({ name: "", active: true })}>Nueva marca</Btn>} />
      ) : (
        <Card className="!p-0 overflow-hidden">
          <ul className="divide-y divide-black/5">
            {rows.map((b) => (
              <li key={b.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--navy)]/5 text-[var(--navy)]">
                  <Icon name="brand" className="size-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-[14px] font-semibold text-[var(--navy)]">{b.name}</span>{" "}
                  <Badge active={b.active} />
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Btn variant="ghost" size="sm" icon="edit" onClick={() => setEditing(b)}>Editar</Btn>
                  <Btn variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => remove(b)}><Icon name="trash" className="size-4" /></Btn>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Editar marca" : "Nueva marca"}>
        {editing && (
          <div className="space-y-4">
            <Field label="Nombre">
              <TextInput value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Hikvision" />
            </Field>
            <Toggle checked={editing.active ?? true} onChange={(v) => setEditing({ ...editing, active: v })} label="Activa" />
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
