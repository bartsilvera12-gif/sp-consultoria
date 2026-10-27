"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/supabase/client";
import { logAudit } from "@/lib/supabase/auth";
import { useAdminAuth } from "@/components/admin/admin-provider";
import {
  PageHeader, Btn, Card, Modal, Field, TextInput, TextArea, Toggle, Badge,
  Loading, EmptyState, ErrorState, Icon, useUI,
} from "@/components/admin/ui";
import type { Service, ServiceTag } from "@/lib/supabase/types";

type TagDraft = { id?: string; label_es: string; label_en: string };
type Draft = Partial<Service> & { tags?: TagDraft[] };

const EMPTY: Draft = { icon: "", title_es: "", title_en: "", description_es: "", description_en: "", sort_order: 0, active: true, tags: [] };

export default function ServicesPage() {
  const { userId } = useAdminAuth();
  const { toast, confirm } = useUI();
  const [rows, setRows] = useState<Service[] | null>(null);
  const [tagsByService, setTagsByService] = useState<Record<string, ServiceTag[]>>({});
  const [err, setErr] = useState(false);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [sv, tg] = await Promise.all([
        db().from("services").select("*").order("sort_order"),
        db().from("service_tags").select("*").order("sort_order"),
      ]);
      if (sv.error) throw sv.error;
      setRows((sv.data as Service[]) ?? []);
      const map: Record<string, ServiceTag[]> = {};
      for (const t of (tg.data as ServiceTag[]) ?? []) (map[t.service_id] ??= []).push(t);
      setTagsByService(map);
    } catch { setErr(true); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openEdit(s: Service) {
    setEditing({ ...s, tags: (tagsByService[s.id] ?? []).map((t) => ({ id: t.id, label_es: t.label_es, label_en: t.label_en })) });
  }

  async function save() {
    if (!editing?.title_es?.trim()) { toast("El título en español es obligatorio.", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        icon: editing.icon?.trim() || null,
        title_es: editing.title_es!.trim(),
        title_en: editing.title_en?.trim() || editing.title_es!.trim(),
        description_es: editing.description_es?.trim() || null,
        description_en: editing.description_en?.trim() || null,
        sort_order: Number(editing.sort_order) || 0,
        active: editing.active ?? true,
      };
      let id = editing.id;
      if (id) {
        const { error } = await db().from("services").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await db().from("services").insert(payload).select("id").single();
        if (error) throw error;
        id = (data as { id: string }).id;
      }

      // Sincronizar tags: borrar todas y reinsertar (cantidades chicas).
      await db().from("service_tags").delete().eq("service_id", id);
      const tags = (editing.tags ?? []).filter((t) => t.label_es.trim());
      if (tags.length) {
        await db().from("service_tags").insert(tags.map((t, i) => ({
          service_id: id, label_es: t.label_es.trim(), label_en: t.label_en.trim() || t.label_es.trim(), sort_order: i,
        })));
      }

      await logAudit(userId!, editing.id ? "update" : "create", "service", id);
      toast(editing.id ? "Servicio actualizado." : "Servicio creado.");
      setEditing(null);
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : "No se pudo guardar.", "error");
    } finally { setSaving(false); }
  }

  async function remove(s: Service) {
    const ok = await confirm({ title: "Eliminar servicio", message: `"${s.title_es}".`, confirmLabel: "Eliminar", danger: true });
    if (!ok) return;
    const { error } = await db().from("services").delete().eq("id", s.id);
    if (error) { toast(error.message, "error"); return; }
    await logAudit(userId!, "delete", "service", s.id);
    toast("Servicio eliminado.");
    load();
  }

  const tags = editing?.tags ?? [];
  const setTags = (t: TagDraft[]) => setEditing((e) => (e ? { ...e, tags: t } : e));

  return (
    <div>
      <PageHeader title="Servicios" subtitle="Lo que ofrece SP Consultoría.">
        <Btn icon="plus" onClick={() => setEditing({ ...EMPTY, sort_order: (rows?.length ?? 0) + 1 })}>Nuevo servicio</Btn>
      </PageHeader>

      {err ? <ErrorState /> : rows === null ? <Loading /> : rows.length === 0 ? (
        <EmptyState icon="wrench" title="Sin servicios"
          action={<Btn icon="plus" onClick={() => setEditing({ ...EMPTY, sort_order: 1 })}>Nuevo servicio</Btn>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((s) => (
            <Card key={s.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[15px] font-bold text-[var(--navy)]">{s.title_es}</span>
                  <Badge active={s.active} />
                </div>
              </div>
              {s.description_es && <p className="mt-1.5 line-clamp-2 text-[13px] text-muted-foreground">{s.description_es}</p>}
              {(tagsByService[s.id] ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(tagsByService[s.id] ?? []).map((t) => (
                    <span key={t.id} className="rounded-full bg-[var(--navy)]/5 px-2.5 py-0.5 text-[11px] font-medium text-[var(--navy)]">{t.label_es}</span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-end gap-1 border-t border-black/5 pt-3">
                <Btn variant="ghost" size="sm" icon="edit" onClick={() => openEdit(s)}>Editar</Btn>
                <Btn variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => remove(s)}><Icon name="trash" className="size-4" /></Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Editar servicio" : "Nuevo servicio"} wide>
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Título" lang="ES"><TextInput value={editing.title_es ?? ""} onChange={(e) => setEditing({ ...editing, title_es: e.target.value })} /></Field>
              <Field label="Título" lang="EN"><TextInput value={editing.title_en ?? ""} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} /></Field>
            </div>
            <Field label="Descripción" lang="ES"><TextArea value={editing.description_es ?? ""} onChange={(e) => setEditing({ ...editing, description_es: e.target.value })} /></Field>
            <Field label="Descripción" lang="EN"><TextArea value={editing.description_en ?? ""} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ícono" hint="opcional"><TextInput value={editing.icon ?? ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="shield" /></Field>
              <Field label="Orden"><TextInput type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
            </div>

            {/* Tags */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[var(--navy)]">Etiquetas</span>
                <Btn variant="ghost" size="sm" icon="plus" onClick={() => setTags([...tags, { label_es: "", label_en: "" }])}>Agregar</Btn>
              </div>
              <div className="space-y-2">
                {tags.length === 0 && <p className="text-[12px] text-muted-foreground">Sin etiquetas.</p>}
                {tags.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <TextInput value={t.label_es} onChange={(e) => setTags(tags.map((x, j) => j === i ? { ...x, label_es: e.target.value } : x))} placeholder="Etiqueta (ES)" />
                    <TextInput value={t.label_en} onChange={(e) => setTags(tags.map((x, j) => j === i ? { ...x, label_en: e.target.value } : x))} placeholder="Label (EN)" />
                    <button onClick={() => setTags(tags.filter((_, j) => j !== i))} className="grid size-9 shrink-0 place-items-center rounded-lg text-red-600 hover:bg-red-50"><Icon name="x" className="size-4" /></button>
                  </div>
                ))}
              </div>
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
