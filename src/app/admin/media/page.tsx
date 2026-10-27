"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, db } from "@/lib/supabase/client";
import { logAudit } from "@/lib/supabase/auth";
import { useAdminAuth } from "@/components/admin/admin-provider";
import {
  PageHeader, Btn, Card, Loading, EmptyState, ErrorState, Icon, useUI,
} from "@/components/admin/ui";
import type { MediaAsset } from "@/lib/supabase/types";

const BUCKET = "spconsultoriaweb-media";

function prettySize(n: number | null) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function MediaPage() {
  const { userId } = useAdminAuth();
  const { toast, confirm } = useUI();
  const [rows, setRows] = useState<MediaAsset[] | null>(null);
  const [err, setErr] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { data, error } = await db().from("media_assets").select("*").order("created_at", { ascending: false });
    if (error) { setErr(true); return; }
    setRows((data as MediaAsset[]) ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function onFiles(files: FileList) {
    if (!supabase) { toast("Supabase no está configurado.", "error"); return; }
    setUploading(true);
    let okCount = 0;
    for (const file of Array.from(files)) {
      try {
        const ext = file.name.split(".").pop() || "bin";
        const path = `media/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        await db().from("media_assets").insert({
          bucket: BUCKET, path, public_url: data.publicUrl,
          mime_type: file.type || null, size_bytes: file.size, created_by: userId,
        });
        okCount++;
      } catch (e) {
        toast(`No se pudo subir ${file.name}: ${e instanceof Error ? e.message : ""}`, "error");
      }
    }
    if (okCount) { toast(`${okCount} archivo${okCount === 1 ? "" : "s"} subido${okCount === 1 ? "" : "s"}.`); await logAudit(userId!, "upload", "media_asset"); }
    setUploading(false);
    await load();
  }

  async function copy(url: string | null) {
    if (!url) return;
    try { await navigator.clipboard.writeText(url); toast("URL copiada."); }
    catch { toast("No se pudo copiar.", "error"); }
  }

  async function remove(m: MediaAsset) {
    const ok = await confirm({ title: "Eliminar archivo", message: "Se borrará del almacenamiento. Si está en uso, dejará de mostrarse.", confirmLabel: "Eliminar", danger: true });
    if (!ok) return;
    try {
      if (supabase) await supabase.storage.from(m.bucket).remove([m.path]);
      await db().from("media_assets").delete().eq("id", m.id);
      await logAudit(userId!, "delete", "media_asset", m.id);
      toast("Archivo eliminado.");
      load();
    } catch (e) { toast(e instanceof Error ? e.message : "No se pudo eliminar.", "error"); }
  }

  const isImg = (m: MediaAsset) => (m.mime_type ?? "").startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(m.path);

  return (
    <div>
      <PageHeader title="Multimedia" subtitle="Imágenes y archivos del sitio.">
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files?.length) onFiles(e.target.files); e.target.value = ""; }} />
        <Btn icon="up" loading={uploading} onClick={() => inputRef.current?.click()}>Subir archivos</Btn>
      </PageHeader>

      {err ? <ErrorState /> : rows === null ? <Loading /> : rows.length === 0 ? (
        <EmptyState icon="image" title="Sin archivos" message="Subí imágenes para usarlas en productos y secciones."
          action={<Btn icon="up" loading={uploading} onClick={() => inputRef.current?.click()}>Subir archivos</Btn>} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((m) => (
            <Card key={m.id} className="!p-3">
              <div className="grid aspect-square place-items-center overflow-hidden rounded-lg border border-black/5 bg-[#f3f5f9]">
                {isImg(m) && m.public_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.public_url} alt={m.alt_es ?? ""} className="size-full object-contain" />
                ) : <Icon name="doc" className="size-8 text-black/20" />}
              </div>
              <div className="mt-2 truncate text-[12px] font-medium text-[var(--navy)]">{m.path.split("/").pop()}</div>
              <div className="text-[11px] text-muted-foreground">{prettySize(m.size_bytes)}</div>
              <div className="mt-2 flex items-center gap-1">
                <Btn variant="secondary" size="sm" icon="copy" onClick={() => copy(m.public_url)} className="flex-1">Copiar URL</Btn>
                <Btn variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => remove(m)}><Icon name="trash" className="size-4" /></Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
