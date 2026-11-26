"use client";

import { useQueryClient } from "@tanstack/react-query";
import { EditDrawer } from "@/components/edit-drawer";
import {
  useGetAmbienteService,
  useUpdateAmbienteService,
  type Ambiente,
} from "@/services/api/services/ambientes";
import { AmbienteForm } from "./ambiente-form";

function parseEstacoesTrabalho(descricao?: string | null): number | null {
  const rawDesc = descricao || "";
  if (!rawDesc.includes("estações de trabalho")) return null;
  const match = rawDesc.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

type AmbienteEditDrawerProps = {
  /** Ambiente em edição. `null` mantém o drawer fechado. */
  id: string | null;
  onClose: () => void;
};

/** Edição de ambiente em um drawer, sem sair da lista. */
export function AmbienteEditDrawer({ id, onClose }: AmbienteEditDrawerProps) {
  const queryClient = useQueryClient();
  const getAmbiente = useGetAmbienteService();
  const updateAmbiente = useUpdateAmbienteService();

  return (
    <EditDrawer<Ambiente>
      id={id}
      onClose={onClose}
      title="Editar ambiente"
      queryKey={(id) => ["ambientes", id]}
      load={getAmbiente}
    >
      {(ambiente, { close }) => (
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
          onCancel={close}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["ambientes"] });
            close();
          }}
          onSave={(data) => {
            const descricao = data.estacoesTrabalho
              ? `${data.estacoesTrabalho} estações de trabalho`
              : undefined;

            return updateAmbiente(ambiente.id, {
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
    </EditDrawer>
  );
}
