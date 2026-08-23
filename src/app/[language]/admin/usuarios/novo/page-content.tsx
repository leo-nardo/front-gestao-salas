"use client";

import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin-header";
import { UsuarioForm, UsuarioFormData } from "../usuario-form";
import { useAuthInviteUserService } from "@/services/api/services/auth";

export default function PageContent() {
  const router = useRouter();
  const inviteUser = useAuthInviteUserService();

  return (
    <>
      <AdminHeader title="Novo usuário" />
      <UsuarioForm
        title="Novo usuário"
        description="Preencha as informações para cadastrar uma nova pessoa no sistema."
        submitLabel="Salvar usuário"
        submittingLabel="Salvando..."
        successMessage="Usuário pré-cadastrado! Envie o convite de acesso na lista de usuários."
        showInviteNotice
        onSave={(data: UsuarioFormData) =>
          inviteUser({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: { id: Number(data.roleId) },
          })
        }
        onSaved={() => router.push("/admin/usuarios")}
      />
    </>
  );
}
