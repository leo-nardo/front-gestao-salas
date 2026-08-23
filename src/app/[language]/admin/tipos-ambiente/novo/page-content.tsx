"use client";

import { AdminHeader } from "@/components/admin-header";
import { useCreateTipoAmbienteService } from "@/services/api/services/tipo-ambientes";
import { TipoAmbienteForm } from "../tipoambiente-form";

export default function PageContent() {
  const createTipoAmbiente = useCreateTipoAmbienteService();

  return (
    <>
      <AdminHeader title="Novo tipo de ambiente" />
      <TipoAmbienteForm
        title="Cadastrar tipo"
        submitLabel="Cadastrar tipo"
        submittingLabel="Salvando..."
        successMessage="Tipo de ambiente cadastrado com sucesso!"
        onSave={(data) =>
          createTipoAmbiente({
            nome: data.nome,
            descricao: data.descricao || undefined,
          })
        }
      />
    </>
  );
}
