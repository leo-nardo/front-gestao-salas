"use client";

import { useQueryClient } from "@tanstack/react-query";
import { EditDrawer } from "@/components/edit-drawer";
import type { User } from "@/services/api/types/user";
import {
  useGetUserService,
  usePatchUserService,
} from "@/services/api/services/users";
import { UsuarioForm } from "./usuario-form";

type UsuarioEditDrawerProps = {
  /** Registro em edição. `null` mantém o drawer fechado. */
  id: string | null;
  onClose: () => void;
};

/** Edição de usuário em um drawer, sem sair da lista. */
export function UsuarioEditDrawer({ id, onClose }: UsuarioEditDrawerProps) {
  const queryClient = useQueryClient();
  const get = useGetUserService();
  const update = usePatchUserService();

  return (
    <EditDrawer<User>
      id={id}
      onClose={onClose}
      title="Editar usuário"
      queryKey={(id) => ["user", id]}
      load={(id) => get({ id })}
    >
      {(e, { close }) => (
        <UsuarioForm
          variant="drawer"
          title="Editar usuário"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Usuário atualizado com sucesso!"
          defaultValues={{
            firstName: e.firstName || "",
            lastName: e.lastName || "",
            email: e.email || "",
            roleId: e.role?.id ? String(e.role.id) : "",
          }}
          onSave={(data) =>
            update({
              id: e.id,
              data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                role: { id: Number(data.roleId) },
              },
            })
          }
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["users-list"] });
            close();
          }}
          onCancel={close}
        />
      )}
    </EditDrawer>
  );
}
