"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/supabase/client";
import { logAudit } from "@/lib/supabase/auth";
import { useAdminAuth } from "@/components/admin/admin-provider";
import {
  PageHeader, Btn, Card, Modal, Field, TextInput, Select, Toggle, Badge,
  Loading, EmptyState, ErrorState, Icon, useUI,
} from "@/components/admin/ui";
import type { AdminUser, Role } from "@/lib/supabase/types";

type Draft = Partial<AdminUser>;
const ROLE_LABEL: Record<Role, string> = { superadmin: "Superadmin", editor: "Editor" };

export default function AdminsPage() {
  const router = useRouter();
  const { admin, userId } = useAdminAuth();
  const { toast, confirm } = useUI();
  const [rows, setRows] = useState<AdminUser[] | null>(null);
  const [err, setErr] = useState(false);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sólo superadmin puede entrar.
  useEffect(() => {
    if (admin && admin.role !== "superadmin") router.replace("/admin");
  }, [admin, router]);

  const load = useCallback(async () => {
    const { data, error } = await db().from("admin_users").select("*").order("created_at");
    if (error) { setErr(true); return; }
    setRows((data as AdminUser[]) ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() { setIsNew(true); setEditing({ user_id: "", email: "", full_name: "", role: "editor", active: true }); }
  function openEdit(a: AdminUser) { setIsNew(false); setEditing(a); }

  async function save() {
    if (!editing) return;
    if (isNew && !editing.user_id?.trim()) { toast("Pegá el User UID de Supabase Auth.", "error"); return; }
    if (!editing.email?.trim()) { toast("Ingresá el email.", "error"); return; }
    setSaving(true);
    try {
      if (isNew) {
        const { error } = await db().from("admin_users").insert({
          user_id: editing.user_id!.trim(), email: editing.email!.trim(),
          full_name: editing.full_name?.trim() || null, role: editing.role ?? "editor", active: editing.active ?? true,
        });
        if (error) throw error;
        await logAudit(userId!, "create", "admin_user");
        toast("Administrador autorizado.");
      } else {
        const { error } = await db().from("admin_users").update({
          full_name: editing.full_name?.trim() || null, role: editing.role, active: editing.active,
        }).eq("id", editing.id!);
        if (error) throw error;
        await logAudit(userId!, "update", "admin_user", editing.id);
        toast("Administrador actualizado.");
      }
      setEditing(null);
      await load();
    } catch (e) { toast(e instanceof Error ? e.message : "No se pudo guardar.", "error"); }
    finally { setSaving(false); }
  }

  async function remove(a: AdminUser) {
    if (a.user_id === userId) { toast("No podés eliminar tu propia cuenta.", "error"); return; }
    const ok = await confirm({ title: "Quitar administrador", message: `${a.email} perderá el acceso al panel. (El usuario de login no se borra.)`, confirmLabel: "Quitar acceso", danger: true });
    if (!ok) return;
    const { error } = await db().from("admin_users").delete().eq("id", a.id);
    if (error) { toast(error.message, "error"); return; }
    await logAudit(userId!, "delete", "admin_user", a.id);
    load();
  }

  if (admin && admin.role !== "superadmin") return null;

  return (
    <div>
      <PageHeader title="Administradores" subtitle="Quién puede acceder al panel.">
        <Btn icon="plus" onClick={openNew}>Autorizar administrador</Btn>
      </PageHeader>

      {err ? <ErrorState /> : rows === null ? <Loading /> : rows.length === 0 ? (
        <EmptyState icon="users" title="Sin administradores" action={<Btn icon="plus" onClick={openNew}>Autorizar administrador</Btn>} />
      ) : (
        <Card className="!p-0 overflow-hidden">
          <ul className="divide-y divide-black/5">
            {rows.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--navy)]/5 text-[var(--navy)]"><Icon name="users" className="size-[18px]" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-[14px] font-semibold text-[var(--navy)]">{a.full_name || a.email}</span>
                    <span className="rounded-full bg-[var(--navy)]/10 px-2 py-0.5 text-[11px] font-semibold text-[var(--navy)]">{ROLE_LABEL[a.role]}</span>
                    <Badge active={a.active} />
                    {a.user_id === userId && <span className="text-[11px] text-muted-foreground">(vos)</span>}
                  </div>
                  <div className="truncate text-[12px] text-muted-foreground">{a.email}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Btn variant="ghost" size="sm" icon="edit" onClick={() => openEdit(a)}>Editar</Btn>
                  {a.user_id !== userId && <Btn variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => remove(a)}><Icon name="trash" className="size-4" /></Btn>}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={isNew ? "Autorizar administrador" : "Editar administrador"}>
        {editing && (
          <div className="space-y-4">
            {isNew && (
              <>
                <div className="rounded-lg border border-[var(--navy)]/15 bg-[var(--navy)]/5 px-3.5 py-2.5 text-[12px] text-[var(--navy)]">
                  Primero creá el usuario en <strong>Supabase → Authentication → Add user</strong>, copiá su <strong>User UID</strong> y pegalo acá.
                </div>
                <Field label="User UID" help="UUID del usuario en Supabase Auth."><TextInput value={editing.user_id ?? ""} onChange={(e) => setEditing({ ...editing, user_id: e.target.value })} placeholder="00000000-0000-…" /></Field>
                <Field label="Email"><TextInput type="email" value={editing.email ?? ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></Field>
              </>
            )}
            {!isNew && (
              <Field label="Email"><TextInput value={editing.email ?? ""} disabled /></Field>
            )}
            <Field label="Nombre completo"><TextInput value={editing.full_name ?? ""} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} /></Field>
            <Field label="Rol" help="Superadmin gestiona administradores.">
              <Select value={editing.role ?? "editor"} onChange={(e) => setEditing({ ...editing, role: e.target.value as Role })}>
                <option value="editor">Editor</option>
                <option value="superadmin">Superadmin</option>
              </Select>
            </Field>
            <Toggle checked={editing.active ?? true} onChange={(v) => setEditing({ ...editing, active: v })} label="Acceso activo" description="Si se apaga, no puede iniciar sesión." />
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
