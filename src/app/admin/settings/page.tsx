"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/supabase/client";
import { logAudit } from "@/lib/supabase/auth";
import { useAdminAuth } from "@/components/admin/admin-provider";
import {
  PageHeader, Card, Btn, Field, TextInput, Loading, ErrorState, useUI,
} from "@/components/admin/ui";
import { ImageField } from "@/components/admin/image-field";
import type { SiteSettings } from "@/lib/supabase/types";

export default function SettingsPage() {
  const { userId } = useAdminAuth();
  const { toast } = useUI();
  const [s, setS] = useState<SiteSettings | null>(null);
  const [err, setErr] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await db().from("site_settings").select("*").limit(1).maybeSingle();
      if (error) { setErr(true); return; }
      setS((data as SiteSettings) ?? ({} as SiteSettings));
    })();
  }, []);

  function set<K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) {
    setS((prev) => (prev ? { ...prev, [k]: v } : prev));
  }

  async function save() {
    if (!s) return;
    setSaving(true);
    try {
      const payload = {
        company_name: s.company_name, tagline_es: s.tagline_es, tagline_en: s.tagline_en,
        phone: s.phone, phone_raw: s.phone_raw, email: s.email, address: s.address,
        whatsapp_number: s.whatsapp_number, whatsapp_url: s.whatsapp_url, maps_url: s.maps_url,
        instagram_url: s.instagram_url, tiktok_url: s.tiktok_url,
        logo_url: s.logo_url, favicon_url: s.favicon_url, og_image_url: s.og_image_url,
      };
      if (s.id) {
        const { error } = await db().from("site_settings").update(payload).eq("id", s.id);
        if (error) throw error;
      } else {
        const { data, error } = await db().from("site_settings").insert(payload).select("id").single();
        if (error) throw error;
        set("id", (data as { id: string }).id);
      }
      await logAudit(userId!, "update", "site_settings", s.id);
      toast("Configuración guardada.");
    } catch (e) { toast(e instanceof Error ? e.message : "No se pudo guardar.", "error"); }
    finally { setSaving(false); }
  }

  if (err) return <div><PageHeader title="Configuración" /><ErrorState /></div>;
  if (!s) return <Loading />;

  const field = (k: keyof SiteSettings, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <TextInput value={(s[k] as string) ?? ""} onChange={(e) => set(k, e.target.value as never)} {...props} />
  );

  return (
    <div>
      <PageHeader title="Configuración" subtitle="Datos generales del sitio y de contacto.">
        <Btn loading={saving} icon="check" onClick={save}>Guardar cambios</Btn>
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-[var(--navy)]">Empresa</h3>
          <Field label="Nombre de la empresa">{field("company_name")}</Field>
          <Field label="Eslogan" lang="ES">{field("tagline_es")}</Field>
          <Field label="Eslogan" lang="EN">{field("tagline_en")}</Field>
        </Card>

        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-[var(--navy)]">Contacto</h3>
          <Field label="Teléfono (visible)">{field("phone", { placeholder: "+595 ..." })}</Field>
          <Field label="Teléfono (solo números)" help="Para enlaces tel:">{field("phone_raw", { placeholder: "595..." })}</Field>
          <Field label="Email">{field("email", { type: "email" })}</Field>
          <Field label="Dirección">{field("address")}</Field>
        </Card>

        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-[var(--navy)]">WhatsApp y mapa</h3>
          <Field label="Número de WhatsApp" help="Solo números, con código de país.">{field("whatsapp_number", { placeholder: "595..." })}</Field>
          <Field label="URL de WhatsApp" hint="opcional">{field("whatsapp_url", { placeholder: "https://wa.me/595..." })}</Field>
          <Field label="URL de Google Maps">{field("maps_url")}</Field>
        </Card>

        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-[var(--navy)]">Redes sociales</h3>
          <Field label="Instagram">{field("instagram_url", { placeholder: "https://instagram.com/..." })}</Field>
          <Field label="TikTok">{field("tiktok_url", { placeholder: "https://tiktok.com/@..." })}</Field>
        </Card>

        <Card className="space-y-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-[var(--navy)]">Imágenes de marca</h3>
          <div className="grid gap-5 sm:grid-cols-3">
            <ImageField label="Logo" folder="brand" value={s.logo_url} onChange={(u) => set("logo_url", u)} />
            <ImageField label="Favicon" folder="brand" value={s.favicon_url} onChange={(u) => set("favicon_url", u)} />
            <ImageField label="Imagen para compartir (OG)" folder="brand" value={s.og_image_url} onChange={(u) => set("og_image_url", u)} />
          </div>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Btn loading={saving} icon="check" onClick={save}>Guardar cambios</Btn>
      </div>
    </div>
  );
}
