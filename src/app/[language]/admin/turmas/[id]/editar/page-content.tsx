"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminHeader } from "@/components/admin-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetTurmaService,
  useUpdateTurmaService,
} from "@/services/api/services/turmas";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { TurmaForm } from "../../turma-form";

export default function PageContent({ id }: { id: string }) {
  const getTurma = useGetTurmaService();
  const updateTurma = useUpdateTurmaService();

  const { data: res, isLoading } = useQuery({
    queryKey: ["turmas", id],
    queryFn: () => getTurma(id),
  });

  const turma = res?.status === HTTP_CODES_ENUM.OK ? res.data : null;

  return (
    <>
      <AdminHeader title="Editar Turma" />

      {isLoading || !turma ? (
        <div className="p-6 max-w-[600px] mx-auto w-full space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      ) : (
        <TurmaForm
          title="Editar turma"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Turma atualizada com sucesso!"
          defaultValues={{
            codigo: turma.codigo,
            periodo: turma.periodo,
            cursoId: turma.curso?.id || "",
          }}
          onSave={(data) =>
            updateTurma(id, {
              codigo: data.codigo,
              periodo: data.periodo,
              curso: { id: data.cursoId },
            })
          }
        />
      )}
    </>
  );
}
