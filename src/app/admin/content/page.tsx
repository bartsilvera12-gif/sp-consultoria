"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "@/lib/supabase/client";
import { logAudit } from "@/lib/supabase/auth";
import { useAdminAuth } from "@/components/admin/admin-provider";
import {
  PageHeader, Btn, Card, Modal, Field, TextInput, TextArea, Toggle, Badge,
  Loading, EmptyState, ErrorState, useUI,
} from "@/components/admin/ui";
import { ImageField } from "@/components/admin/image-field";
import type { ContentSection } from "@/lib/supabase/types";

const SECTION_LABELS: Record<string, string> = {
  hero: "Portada (Hero)", about: "Nosotros", mission: "Misión", vision: "Visión",
  values: "Valores", services: "Servicios", methodology: "Metodología", process: "Proceso",
  contact: "Contacto", products: "Productos", footer: "Pie de página", cta: "Llamado a la acción",
};
const FIELD_LABELS: Record<string, string> = {
  title: "Título", subtitle: "Subtítulo", heading: "Encabezado", text: "Texto", body: "Cuerpo",
  description: "Descripción", eyebrow: "Antetítulo", cta: "Botón", button: "Botón", label: "Etiqueta",
  badge: "Insignia", quote: "Cita", caption: "Leyenda", note: "Nota",
};

function label(key: string, dict: Record<string, string>) {
  return dict[key] ?? key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
}

/** Campo de texto que elige input o textarea según el largo / si es JSON. */
function AutoField({ value, onChange, long, json }: { value: string; onChange: (v: string) => void; long: boolean; json: boolean }) {
  const cls = json ? "font-mono text-[12px]" : "";
  return long
    ? <TextArea value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
    : <TextInput value={value} onChange={(e) => onChange(e.target.value)} className={cls} />;
}

type Draft = {
  row: ContentSection;
  es: Record<string, string>;
  en: Record<string, string>;
  jsonKeys: Set<string>;
};

export default function ContentPage() {
  const { userId } = useAdminAuth();
  const { toast } = useUI();
  const [rows, setRows] = useState<ContentSection[] | null>(null);
  const [err, setErr] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await db().from("content_sections").select("*").order("sort_order");
    if (error) { setErr(true); return; }
    setRows((data as ContentSection[]) ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openEdit(row: ContentSection) {
    const es: Record<string, string> = {};
    const en: Record<string, string> = {};
    const jsonKeys = new Set<string>();
    const keys = new Set([...Object.keys(row.content_es ?? {}), ...Object.keys(row.content_en ?? {})]);
    for (const k of keys) {
      const ev = (row.content_es ?? {})[k];
      const nv = (row.content_en ?? {})[k];
      const simple = (v: unknown) => v === undefined || v === null || typeof v === "string";
      if (simple(ev) && simple(nv)) {
        es[k] = (ev as string) ?? "";
        en[k] = (nv as string) ?? "";
      } else {
        jsonKeys.add(k);
        es[k] = JSON.stringify(ev ?? null, null, 2);
        en[k] = JSON.stringify(nv ?? null, null, 2);
      }
    }
    setDraft({ row, es, en, jsonKeys });
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    try {
      const build = (src: Record<string, string>) => {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(src)) {
          if (draft.jsonKeys.has(k)) { try { out[k] = JSON.parse(v); } catch { throw new Error(`JSON inválido en el campo "${k}".`); } }
          else out[k] = v;
        }
        return out;
      };
      const payload = {
        content_es: build(draft.es),
        content_en: build(draft.en),
        image_url: draft.row.image_url,
        active: draft.row.active,
      };
      const { error } = await db().from("content_sections").update(payload).eq("id", draft.row.id);
      if (error) throw error;
      await logAudit(userId!, "update", "content_section", draft.row.id, { section_key: draft.row.section_key });
      toast("Contenido guardado.");
      setDraft(null);
      await load();
    } catch (e) { toast(e instanceof Error ? e.message : "No se pudo guardar.", "error"); }
    finally { setSaving(false); }
  }

  const keys = useMemo(() => (draft ? Object.keys(draft.es).length ? Object.keys(draft.es) : Object.keys(draft.en) : []), [draft]);

  return (
    <div>
      <PageHeader title="Secciones de contenido" subtitle="Textos de cada sección de la página, en español e inglés." />

      {err ? <ErrorState /> : rows === null ? <Loading /> : rows.length === 0 ? (
        <EmptyState icon="doc" title="Sin secciones" message="El contenido se carga desde la migración inicial." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <Card key={r.id} className="flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[15px] font-bold text-[var(--navy)]">{label(r.section_key, SECTION_LABELS)}</span>
                <Badge active={r.active} labels={["Visible", "Oculta"]} />
              </div>
              <code className="mt-1 text-[11px] text-muted-foreground">{r.section_key}</code>
              <p className="mt-2 line-clamp-2 text-[12.5px] text-muted-foreground">
                {Object.values(r.content_es ?? {}).filter((v) => typeof v === "string").slice(0, 1).join(" ") || "—"}
              </p>
              <div className="mt-auto flex justify-end pt-3">
                <Btn variant="ghost" size="sm" icon="edit" onClick={() => openEdit(r)}>Editar</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft ? label(draft.row.section_key, SECTION_LABELS) : ""} wide>
        {draft && (
          <div className="space-y-5">
            {keys.length === 0 && <p className="text-sm text-muted-foreground">Esta sección no tiene campos de texto editables.</p>}
            {keys.map((k) => {
              const isJson = draft.jsonKeys.has(k);
              const long = (draft.es[k]?.length ?? 0) > 60 || isJson;
              return (
                <div key={k} className="rounded-xl border border-black/5 bg-[#f9fafb] p-4">
                  <div className="mb-2 text-[13px] font-bold text-[var(--navy)]">
                    {label(k, FIELD_LABELS)} {isJson && <span className="ml-1 rounded bg-black/10 px-1.5 py-0.5 text-[10px] font-normal">avanzado (JSON)</span>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Español" lang="ES">
                      <AutoField value={draft.es[k] ?? ""} long={long} json={isJson} onChange={(v) => setDraft({ ...draft, es: { ...draft.es, [k]: v } })} />
                    </Field>
                    <Field label="Inglés" lang="EN">
                      <AutoField value={draft.en[k] ?? ""} long={long} json={isJson} onChange={(v) => setDraft({ ...draft, en: { ...draft.en, [k]: v } })} />
                    </Field>
                  </div>
                </div>
              );
            })}

            <ImageField label="Imagen de la sección" folder="content" value={draft.row.image_url} onChange={(u) => setDraft({ ...draft, row: { ...draft.row, image_url: u } })} />
            <Toggle checked={draft.row.active} onChange={(v) => setDraft({ ...draft, row: { ...draft.row, active: v } })} label="Sección visible" />

            <div className="flex justify-end gap-2.5 border-t border-black/5 pt-4">
              <Btn variant="secondary" onClick={() => setDraft(null)}>Cancelar</Btn>
              <Btn loading={saving} icon="check" onClick={save}>Guardar</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
