"use client";

import { useQueryClient } from "@tanstack/react-query";
import { EditDrawer } from "@/components/edit-drawer";
import {
  useGetTurmaService,
  useUpdateTurmaService,
  type Turma,
} from "@/services/api/services/turmas";
import { TurmaForm } from "./turma-form";

type TurmaEditDrawerProps = {
  /** Registro em edição. `null` mantém o drawer fechado. */
  id: string | null;
  onClose: () => void;
};

/** Edição de turma em um drawer, sem sair da lista. */
export function TurmaEditDrawer({ id, onClose }: TurmaEditDrawerProps) {
  const queryClient = useQueryClient();
  const get = useGetTurmaService();
  const update = useUpdateTurmaService();

  return (
    <EditDrawer<Turma>
      id={id}
      onClose={onClose}
      title="Editar turma"
      queryKey={(id) => ["turmas", id]}
      load={get}
    >
      {(e, { close }) => (
        <TurmaForm
          variant="drawer"
          title="Editar turma"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Turma atualizada com sucesso!"
          defaultValues={{
            codigo: e.codigo,
            periodo: e.periodo,
            cursoId: e.curso?.id || "",
          }}
          onSave={(data) =>
            update(e.id, {
              codigo: data.codigo,
              periodo: data.periodo,
              curso: { id: data.cursoId },
            })
          }
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["turmas"] });
            close();
          }}
          onCancel={close}
        />
      )}
    </EditDrawer>
  );
}
