"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { AdminHeader } from "@/components/admin-header";
import { AulaForm, AulaFormData } from "../../aula-form";
import {
  useGetAulaService,
  useUpdateAulaService,
  DiaSemana,
} from "@/services/api/services/aulas";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function EditAulaPageContent({ id }: { id: string }) {
  const router = useRouter();
  const getAula = useGetAulaService();
  const updateAula = useUpdateAulaService();

  const { data: aulaRes, isLoading } = useQuery({
    queryKey: ["aula", id],
    queryFn: () => getAula(id),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const aula =
    aulaRes?.status === HTTP_CODES_ENUM.OK ? aulaRes.data : undefined;

  const defaultValues: Partial<AulaFormData> | undefined = aula
    ? {
        cursoId: aula.disciplina?.curso?.id || "",
        disciplinaId: aula.disciplina?.id || "",
        professorId: String(aula.professor?.id || ""),
        turmaId: aula.turma?.id || "",
        diaSemana: aula.diaSemana || "",
        horarioInicio: aula.horarioInicio || "",
        horarioFim: aula.horarioFim || "",
        ambienteId: aula.ambiente?.id || "",
      }
    : undefined;

  return (
    <>
      <AdminHeader title="Editar aula" />
      <AulaForm
        title="Editar aula"
        submitLabel="Salvar alterações"
        submittingLabel="Salvando..."
        successMessage="Aula atualizada com sucesso!"
        defaultValues={defaultValues}
        onSave={(data: AulaFormData) =>
          updateAula(id, {
            turma: { id: data.turmaId },
            disciplina: { id: data.disciplinaId },
            professor: { id: data.professorId },
            ambiente: { id: data.ambienteId },
            diaSemana: data.diaSemana as DiaSemana,
            horarioInicio: data.horarioInicio,
            horarioFim: data.horarioFim,
          })
        }
        onSaved={() => router.push("/admin/aulas")}
      />
    </>
  );
}
