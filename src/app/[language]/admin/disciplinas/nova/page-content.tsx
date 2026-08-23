"use client";

import { AdminHeader } from "@/components/admin-header";
import { useCreateDisciplinaService } from "@/services/api/services/disciplinas";
import { DisciplinaForm } from "../disciplina-form";

export default function PageContent() {
  const createDisciplina = useCreateDisciplinaService();

  return (
    <>
      <AdminHeader title="Nova Disciplina" />
      <DisciplinaForm
        title="Nova disciplina"
        submitLabel="Salvar disciplina"
        submittingLabel="Salvando..."
        successMessage="Disciplina criada com sucesso!"
        onSave={(data) =>
          createDisciplina({
            nome: data.nome,
            curso: { id: data.cursoId },
          })
        }
      />
    </>
  );
}
