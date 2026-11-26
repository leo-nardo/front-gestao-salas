"use client";

import { routes } from "@/routes";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin-header";
import { AulaForm, AulaFormData } from "../aula-form";
import { useCreateAulaService, DiaSemana } from "@/services/api/services/aulas";

export default function NovaAulaPageContent() {
  const router = useRouter();
  const createAula = useCreateAulaService();

  return (
    <>
      <AdminHeader title="Nova aula" />
      <AulaForm
        title="Nova aula"
        submitLabel="Salvar aula"
        submittingLabel="Salvando..."
        successMessage="Aula criada com sucesso!"
        onSave={(data: AulaFormData) =>
          createAula({
            turma: { id: data.turmaId },
            disciplina: { id: data.disciplinaId },
            professor: { id: data.professorId },
            ambiente: { id: data.ambienteId },
            diaSemana: data.diaSemana as DiaSemana,
            horarioInicio: data.horarioInicio,
            horarioFim: data.horarioFim,
          })
        }
        onSaved={() => router.push(routes.aulas.admin.list())}
      />
    </>
  );
}
