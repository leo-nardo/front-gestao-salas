"use client";

import { useQueryClient } from "@tanstack/react-query";
import { EditDrawer } from "@/components/edit-drawer";
import {
  useGetCursoService,
  useUpdateCursoService,
  type Curso,
} from "@/services/api/services/cursos";
import { CursoForm } from "./curso-form";

type CursoEditDrawerProps = {
  /** Registro em edição. `null` mantém o drawer fechado. */
  id: string | null;
  onClose: () => void;
};

/** Edição de curso em um drawer, sem sair da lista. */
export function CursoEditDrawer({ id, onClose }: CursoEditDrawerProps) {
  const queryClient = useQueryClient();
  const get = useGetCursoService();
  const update = useUpdateCursoService();

  return (
    <EditDrawer<Curso>
      id={id}
      onClose={onClose}
      title="Editar curso"
      queryKey={(id) => ["cursos", id]}
      load={get}
    >
      {(e, { close }) => (
        <CursoForm
          variant="drawer"
          title="Editar curso"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Curso atualizado com sucesso!"
          defaultValues={{ nome: e.nome || "" }}
          onSave={(data) => update(e.id, { nome: data.nome })}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["cursos"] });
            close();
          }}
          onCancel={close}
        />
      )}
    </EditDrawer>
  );
}
