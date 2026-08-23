"use client";

import { AdminHeader } from "@/components/admin-header";
import { useCreateBlocoService } from "@/services/api/services/blocos";
import { BlocoForm } from "../bloco-form";

export default function PageContent() {
  const createBloco = useCreateBlocoService();

  return (
    <>
      <AdminHeader title="Novo Bloco" />
      <BlocoForm
        title="Cadastrar bloco"
        submitLabel="Cadastrar bloco"
        submittingLabel="Salvando..."
        successMessage="Bloco cadastrado com sucesso!"
        onSave={(data) =>
          createBloco({
            nome: data.nome,
            descricao: data.descricao || undefined,
          })
        }
      />
    </>
  );
}
