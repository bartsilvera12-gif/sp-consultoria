"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/supabase/client";
import { logAudit } from "@/lib/supabase/auth";
import { useAdminAuth } from "@/components/admin/admin-provider";
import {
  PageHeader, Btn, Card, Modal, Field, TextInput, TextArea, Toggle, Badge,
  Loading, EmptyState, ErrorState, Icon, useUI,
} from "@/components/admin/ui";
import type { Page } from "@/lib/supabase/types";

type Draft = Partial<Page>;

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function PagesPage() {
  const { userId } = useAdminAuth();
  const { toast, confirm } = useUI();
  const [rows, setRows] = useState<Page[] | null>(null);
  const [err, setErr] = useState(false);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await db().from("pages").select("*").order("slug");
    if (error) { setErr(true); return; }
    setRows((data as Page[]) ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!editing?.title_es?.trim()) { toast("El título en español es obligatorio.", "error"); return; }
    const slug = (editing.slug?.trim() || slugify(editing.title_es)).trim();
    if (!slug) { toast("No se pudo generar el slug.", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        slug,
        title_es: editing.title_es!.trim(), title_en: editing.title_en?.trim() || null,
        content_es: editing.content_es ?? null, content_en: editing.content_en ?? null,
        meta_title_es: editing.meta_title_es?.trim() || null, meta_title_en: editing.meta_title_en?.trim() || null,
        meta_description_es: editing.meta_description_es?.trim() || null, meta_description_en: editing.meta_description_en?.trim() || null,
        published: editing.published ?? false,
      };
      if (editing.id) {
        const { error } = await db().from("pages").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await db().from("pages").insert(payload);
        if (error) throw error;
      }
      await logAudit(userId!, editing.id ? "update" : "create", "page", editing.id, { slug });
      toast("Página guardada.");
      setEditing(null);
      await load();
    } catch (e) { toast(e instanceof Error ? e.message : "No se pudo guardar.", "error"); }
    finally { setSaving(false); }
  }

  async function remove(p: Page) {
    const ok = await confirm({ title: "Eliminar página", message: `"${p.title_es}".`, confirmLabel: "Eliminar", danger: true });
    if (!ok) return;
    const { error } = await db().from("pages").delete().eq("id", p.id);
    if (error) { toast(error.message, "error"); return; }
    await logAudit(userId!, "delete", "page", p.id);
    load();
  }

  return (
    <div>
      <PageHeader title="Páginas" subtitle="Contenido independiente (ej: términos, privacidad).">
        <Btn icon="plus" onClick={() => setEditing({ slug: "", title_es: "", published: false })}>Nueva página</Btn>
      </PageHeader>

      {err ? <ErrorState /> : rows === null ? <Loading /> : rows.length === 0 ? (
        <EmptyState icon="page" title="Sin páginas" message="Creá páginas adicionales si las necesitás."
          action={<Btn icon="plus" onClick={() => setEditing({ slug: "", title_es: "", published: false })}>Nueva página</Btn>} />
      ) : (
        <Card className="!p-0 overflow-hidden">
          <ul className="divide-y divide-black/5">
            {rows.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--navy)]/5 text-[var(--navy)]"><Icon name="page" className="size-[18px]" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[14px] font-semibold text-[var(--navy)]">{p.title_es}</span>
                    <Badge active={p.published} labels={["Publicada", "Borrador"]} />
                  </div>
                  <code className="text-[12px] text-muted-foreground">/{p.slug}</code>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Btn variant="ghost" size="sm" icon="edit" onClick={() => setEditing(p)}>Editar</Btn>
                  <Btn variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => remove(p)}><Icon name="trash" className="size-4" /></Btn>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Editar página" : "Nueva página"} wide>
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Título" lang="ES"><TextInput value={editing.title_es ?? ""} onChange={(e) => setEditing({ ...editing, title_es: e.target.value })} /></Field>
              <Field label="Título" lang="EN"><TextInput value={editing.title_en ?? ""} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} /></Field>
            </div>
            <Field label="Slug (URL)" help="Ej: terminos, privacidad."><TextInput value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></Field>
            <Field label="Contenido" lang="ES" help="Texto o HTML."><TextArea className="min-h-[140px]" value={editing.content_es ?? ""} onChange={(e) => setEditing({ ...editing, content_es: e.target.value })} /></Field>
            <Field label="Contenido" lang="EN"><TextArea className="min-h-[140px]" value={editing.content_en ?? ""} onChange={(e) => setEditing({ ...editing, content_en: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Meta título" lang="ES"><TextInput value={editing.meta_title_es ?? ""} onChange={(e) => setEditing({ ...editing, meta_title_es: e.target.value })} /></Field>
              <Field label="Meta título" lang="EN"><TextInput value={editing.meta_title_en ?? ""} onChange={(e) => setEditing({ ...editing, meta_title_en: e.target.value })} /></Field>
              <Field label="Meta descripción" lang="ES"><TextArea value={editing.meta_description_es ?? ""} onChange={(e) => setEditing({ ...editing, meta_description_es: e.target.value })} /></Field>
              <Field label="Meta descripción" lang="EN"><TextArea value={editing.meta_description_en ?? ""} onChange={(e) => setEditing({ ...editing, meta_description_en: e.target.value })} /></Field>
            </div>
            <Toggle checked={editing.published ?? false} onChange={(v) => setEditing({ ...editing, published: v })} label="Publicada" description="Si está apagada, queda como borrador." />
            <div className="flex justify-end gap-2.5 pt-1">
              <Btn variant="secondary" onClick={() => setEditing(null)}>Cancelar</Btn>
              <Btn loading={saving} icon="check" onClick={save}>Guardar</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
