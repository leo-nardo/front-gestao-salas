"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminHeader } from "@/components/admin-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAmbienteService,
  useUpdateAmbienteService,
} from "@/services/api/services/ambientes";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { AmbienteForm } from "../../ambiente-form";

function parseEstacoesTrabalho(descricao?: string | null): number | null {
  const rawDesc = descricao || "";
  if (!rawDesc.includes("estações de trabalho")) return null;
  const match = rawDesc.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export default function PageContent({ id }: { id: string }) {
  const getAmbiente = useGetAmbienteService();
  const updateAmbiente = useUpdateAmbienteService();

  const { data: res, isLoading } = useQuery({
    queryKey: ["ambientes", id],
    queryFn: () => getAmbiente(id),
  });

  const ambiente = res?.status === HTTP_CODES_ENUM.OK ? res.data : null;

  return (
    <>
      <AdminHeader title="Editar Ambiente" />

      {isLoading || !ambiente ? (
        <div className="p-6 max-w-[800px] mx-auto w-full space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-[420px] w-full rounded-xl" />
        </div>
      ) : (
        <AmbienteForm
          title="Editar ambiente"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Ambiente atualizado com sucesso!"
          defaultValues={{
            nome: ambiente.nome || "",
            tipoAmbienteId: ambiente.tipoAmbiente?.id || "",
            tipo: ambiente.tipo || "Grade fixa",
            capacidade: ambiente.capacidade || 0,
            unidadeId: ambiente.unidade?.id || "",
            blocoId: ambiente.bloco?.id || "none",
            andarId: ambiente.andar?.id || "none",
            estacoesTrabalho: parseEstacoesTrabalho(ambiente.descricao),
          }}
          onSave={(data) => {
            const descricao = data.estacoesTrabalho
              ? `${data.estacoesTrabalho} estações de trabalho`
              : undefined;

            return updateAmbiente(id, {
              nome: data.nome,
              tipoAmbiente: { id: data.tipoAmbienteId },
              tipo: data.tipo,
              capacidade: data.capacidade,
              unidade: { id: data.unidadeId },
              bloco:
                data.blocoId && data.blocoId !== "none"
                  ? { id: data.blocoId }
                  : null,
              andar:
                data.andarId && data.andarId !== "none"
                  ? { id: data.andarId }
                  : null,
              descricao,
            });
          }}
        />
      )}
    </>
  );
}
