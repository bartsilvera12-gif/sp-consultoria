"use client";

// Campo de imagen: permite pegar una URL o subir un archivo al bucket de Storage.
// Si la subida falla (p.ej. el bucket no existe aún), lo avisa y deja usar la URL.

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Btn, Icon, Label, TextInput, useUI } from "./ui";

const BUCKET = "spconsultoriaweb-media";

export function ImageField({
  value,
  onChange,
  folder = "products",
  label = "Imagen",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
}) {
  const { toast } = useUI();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    if (!supabase) { toast("Supabase no está configurado.", "error"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
      toast("Imagen subida.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast(`No se pudo subir (${msg}). Podés pegar la URL a mano.`, "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-start gap-4">
        <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-black/10 bg-[#f3f5f9]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="size-full object-contain" />
          ) : (
            <Icon name="image" className="size-7 text-black/20" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <TextInput value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} placeholder="https://… o subí un archivo" />
          <div className="flex items-center gap-2">
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
            <Btn type="button" variant="secondary" size="sm" icon="up" loading={uploading} onClick={() => inputRef.current?.click()}>Subir archivo</Btn>
            {value && <Btn type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => onChange(null)}>Quitar</Btn>}
          </div>
        </div>
      </div>
    </div>
  );
}
