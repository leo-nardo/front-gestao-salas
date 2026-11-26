"use client";

import { useQueryClient } from "@tanstack/react-query";
import { EditDrawer } from "@/components/edit-drawer";
import type { DiaSemana } from "@/services/api/services/aulas";
import {
  useGetAulaService,
  useUpdateAulaService,
  type Aula,
} from "@/services/api/services/aulas";
import { AulaForm } from "./aula-form";

type AulaEditDrawerProps = {
  /** Registro em edição. `null` mantém o drawer fechado. */
  id: string | null;
  onClose: () => void;
};

/** Edição de aula em um drawer, sem sair da lista. */
export function AulaEditDrawer({ id, onClose }: AulaEditDrawerProps) {
  const queryClient = useQueryClient();
  const get = useGetAulaService();
  const update = useUpdateAulaService();

  return (
    <EditDrawer<Aula>
      id={id}
      onClose={onClose}
      title="Editar aula"
      queryKey={(id) => ["aulas", id]}
      load={get}
    >
      {(e, { close }) => (
        <AulaForm
          variant="drawer"
          title="Editar aula"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Aula atualizada com sucesso!"
          defaultValues={{
            cursoId: e.disciplina?.curso?.id || "",
            disciplinaId: e.disciplina?.id || "",
            professorId: String(e.professor?.id || ""),
            turmaId: e.turma?.id || "",
            diaSemana: e.diaSemana || "",
            horarioInicio: e.horarioInicio || "",
            horarioFim: e.horarioFim || "",
            ambienteId: e.ambiente?.id || "",
          }}
          onSave={(data) =>
            update(e.id, {
              turma: { id: data.turmaId },
              disciplina: { id: data.disciplinaId },
              professor: { id: data.professorId },
              ambiente: { id: data.ambienteId },
              diaSemana: data.diaSemana as DiaSemana,
              horarioInicio: data.horarioInicio,
              horarioFim: data.horarioFim,
            })
          }
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["aulas"] });
            close();
          }}
          onCancel={close}
        />
      )}
    </EditDrawer>
  );
}
