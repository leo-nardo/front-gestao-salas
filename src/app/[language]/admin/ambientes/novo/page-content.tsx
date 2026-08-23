"use client";

import { AdminHeader } from "@/components/admin-header";
import { useCreateAmbienteService } from "@/services/api/services/ambientes";
import { AmbienteForm } from "../ambiente-form";

export default function PageContent() {
  const createAmbiente = useCreateAmbienteService();

  return (
    <>
      <AdminHeader title="Novo Ambiente" />
      <AmbienteForm
        title="Novo ambiente"
        submitLabel="Salvar ambiente"
        submittingLabel="Salvando..."
        successMessage="Ambiente criado com sucesso!"
        onSave={(data) => {
          const descricao = data.estacoesTrabalho
            ? `${data.estacoesTrabalho} estações de trabalho`
            : undefined;

          return createAmbiente({
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
    </>
  );
}
