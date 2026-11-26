"use client";

import { useQueryClient } from "@tanstack/react-query";
import { EditDrawer } from "@/components/edit-drawer";
import {
  useGetEquipamentoService,
  useUpdateEquipamentoService,
  type Equipamento,
} from "@/services/api/services/equipamentos";
import { EquipamentoForm } from "./equipamento-form";

type EquipamentoEditDrawerProps = {
  /** Registro em edição. `null` mantém o drawer fechado. */
  id: string | null;
  onClose: () => void;
};

/** Edição de equipamento em um drawer, sem sair da lista. */
export function EquipamentoEditDrawer({
  id,
  onClose,
}: EquipamentoEditDrawerProps) {
  const queryClient = useQueryClient();
  const get = useGetEquipamentoService();
  const update = useUpdateEquipamentoService();

  return (
    <EditDrawer<Equipamento>
      id={id}
      onClose={onClose}
      title="Editar equipamento"
      queryKey={(id) => ["equipamentos", id]}
      load={get}
    >
      {(e, { close }) => (
        <EquipamentoForm
          variant="drawer"
          title="Editar equipamento"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Equipamento atualizado com sucesso!"
          defaultValues={{
            nome: e.nome,
            tipo: e.tipo,
            unidadeId: e.unidade?.id || "",
            quantidadeTotal: e.quantidadeTotal,
            descricao: e.descricao || "",
          }}
          onSave={(data) =>
            update(e.id, {
              nome: data.nome,
              tipo: data.tipo,
              unidade: { id: data.unidadeId },
              quantidadeTotal: data.quantidadeTotal,
              descricao: data.descricao,
            })
          }
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["equipamentos"] });
            close();
          }}
          onCancel={close}
        />
      )}
    </EditDrawer>
  );
}
