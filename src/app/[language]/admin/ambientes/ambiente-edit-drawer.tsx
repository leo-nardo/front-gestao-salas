"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useGetAmbienteService,
  useUpdateAmbienteService,
} from "@/services/api/services/ambientes";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { AmbienteForm } from "./ambiente-form";

function parseEstacoesTrabalho(descricao?: string | null): number | null {
  const rawDesc = descricao || "";
  if (!rawDesc.includes("estações de trabalho")) return null;
  const match = rawDesc.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

type AmbienteEditDrawerProps = {
  /** Ambiente em edição. `null` mantém o drawer fechado. */
  ambienteId: string | null;
  onClose: () => void;
};

/**
 * Edição de ambiente em um drawer à direita: a rota continua em
 * /admin/ambientes e a lista fica visível atrás.
 */
export function AmbienteEditDrawer({
  ambienteId,
  onClose,
}: AmbienteEditDrawerProps) {
  // Mantém o último ambiente montado enquanto o drawer desliza para fora;
  // sem isso o corpo some antes de a animação de saída terminar.
  const [contentId, setContentId] = useState(ambienteId);
  if (ambienteId && ambienteId !== contentId) setContentId(ambienteId);

  return (
    <Sheet open={!!ambienteId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle className="text-lg">Editar ambiente</SheetTitle>
          <SheetDescription>
            Os campos com asterisco (*) são obrigatórios.
          </SheetDescription>
        </SheetHeader>

        {contentId && (
          <AmbienteEditContent
            key={contentId}
            ambienteId={contentId}
            onClose={onClose}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function AmbienteEditContent({
  ambienteId,
  onClose,
}: {
  ambienteId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const getAmbiente = useGetAmbienteService();
  const updateAmbiente = useUpdateAmbienteService();

  const { data: res, isLoading } = useQuery({
    queryKey: ["ambientes", ambienteId],
    queryFn: () => getAmbiente(ambienteId),
  });

  const ambiente = res?.status === HTTP_CODES_ENUM.OK ? res.data : null;

  if (isLoading || !ambiente) {
    return (
      <div className="space-y-5 p-4 pt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col pt-6">
      <AmbienteForm
        variant="drawer"
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
        onCancel={onClose}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["ambientes"] });
          onClose();
        }}
        onSave={(data) => {
          const descricao = data.estacoesTrabalho
            ? `${data.estacoesTrabalho} estações de trabalho`
            : undefined;

          return updateAmbiente(ambienteId, {
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
    </div>
  );
}
