"use client";

import { AdminHeader } from "@/components/admin-header";
import { useCreateTurmaService } from "@/services/api/services/turmas";
import { TurmaForm } from "../turma-form";

export default function PageContent() {
  const createTurma = useCreateTurmaService();

  return (
    <>
      <AdminHeader title="Nova Turma" />
      <TurmaForm
        title="Nova turma"
        submitLabel="Salvar turma"
        submittingLabel="Salvando..."
        successMessage="Turma criada com sucesso!"
        onSave={(data) =>
          createTurma({
            curso: { id: data.cursoId },
            codigo: data.codigo,
            periodo: data.periodo,
          })
        }
      />
    </>
  );
}
