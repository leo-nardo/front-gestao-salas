"use client";

import { useQueryClient } from "@tanstack/react-query";
import { EditDrawer } from "@/components/edit-drawer";
import {
  useGetDisciplinaService,
  useUpdateDisciplinaService,
  type Disciplina,
} from "@/services/api/services/disciplinas";
import { DisciplinaForm } from "./disciplina-form";

type DisciplinaEditDrawerProps = {
  /** Registro em edição. `null` mantém o drawer fechado. */
  id: string | null;
  onClose: () => void;
};

/** Edição de disciplina em um drawer, sem sair da lista. */
export function DisciplinaEditDrawer({
  id,
  onClose,
}: DisciplinaEditDrawerProps) {
  const queryClient = useQueryClient();
  const get = useGetDisciplinaService();
  const update = useUpdateDisciplinaService();

  return (
    <EditDrawer<Disciplina>
      id={id}
      onClose={onClose}
      title="Editar disciplina"
      queryKey={(id) => ["disciplinas", id]}
      load={get}
    >
      {(e, { close }) => (
        <DisciplinaForm
          variant="drawer"
          title="Editar disciplina"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Disciplina atualizada com sucesso!"
          defaultValues={{ nome: e.nome, cursoId: e.curso?.id || "" }}
          onSave={(data) =>
            update(e.id, { nome: data.nome, curso: { id: data.cursoId } })
          }
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["disciplinas"] });
            close();
          }}
          onCancel={close}
        />
      )}
    </EditDrawer>
  );
}
