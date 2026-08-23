"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminHeader } from "@/components/admin-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetDisciplinaService,
  useUpdateDisciplinaService,
} from "@/services/api/services/disciplinas";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { DisciplinaForm } from "../../disciplina-form";

export default function PageContent({ id }: { id: string }) {
  const getDisciplina = useGetDisciplinaService();
  const updateDisciplina = useUpdateDisciplinaService();

  const { data: res, isLoading } = useQuery({
    queryKey: ["disciplinas", id],
    queryFn: () => getDisciplina(id),
  });

  const disciplina = res?.status === HTTP_CODES_ENUM.OK ? res.data : null;

  return (
    <>
      <AdminHeader title="Editar Disciplina" />

      {isLoading || !disciplina ? (
        <div className="p-6 max-w-[600px] mx-auto w-full space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      ) : (
        <DisciplinaForm
          title="Editar disciplina"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Disciplina atualizada com sucesso!"
          defaultValues={{
            nome: disciplina.nome,
            cursoId: disciplina.curso?.id || "",
          }}
          onSave={(data) =>
            updateDisciplina(id, {
              nome: data.nome,
              curso: { id: data.cursoId },
            })
          }
        />
      )}
    </>
  );
}
