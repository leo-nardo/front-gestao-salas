"use client";

import { routes } from "@/routes";
import { useQueryClient } from "@tanstack/react-query";
import { EditDrawer } from "@/components/edit-drawer";
import {
  useGetItemPatrimonialService,
  useUpdateItemPatrimonialService,
  type ItemPatrimonial,
} from "@/services/api/services/item-patrimonials";
import { PatrimonioForm } from "./patrimonio-form";

type PatrimonioEditDrawerProps = {
  /** Registro em edição. `null` mantém o drawer fechado. */
  id: string | null;
  onClose: () => void;
};

/** Edição de item em um drawer, sem sair da lista. */
export function PatrimonioEditDrawer({
  id,
  onClose,
}: PatrimonioEditDrawerProps) {
  const queryClient = useQueryClient();
  const get = useGetItemPatrimonialService();
  const update = useUpdateItemPatrimonialService();

  return (
    <EditDrawer<ItemPatrimonial>
      id={id}
      onClose={onClose}
      title="Editar item"
      queryKey={(id) => ["item-patrimoniais", id]}
      load={(id) => get({ id })}
    >
      {(e, { close }) => (
        <PatrimonioForm
          variant="drawer"
          title="Editar item"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Item patrimonial atualizado com sucesso!"
          backHref={routes.patrimonio.admin.list()}
          defaultValues={{
            nome: e.nome,
            tipo: e.tipo,
            ambienteId: e.ambiente?.id || "",
            numeroPatrimonio: e.numeroPatrimonio || "",
            estado: e.estado,
          }}
          onSave={(data) =>
            update({
              id: e.id,
              nome: data.nome,
              tipo: data.tipo,
              ambiente: { id: data.ambienteId },
              numeroPatrimonio: data.numeroPatrimonio || null,
              estado: data.estado,
            })
          }
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["item-patrimoniais"] });
            close();
          }}
          onCancel={close}
        />
      )}
    </EditDrawer>
  );
}
