"use client";

import { AdminHeader } from "@/components/admin-header";
import { useCreateAndarService } from "@/services/api/services/andares";
import { AndarForm } from "../andar-form";

export default function PageContent() {
  const createAndar = useCreateAndarService();

  return (
    <>
      <AdminHeader title="Novo Andar" />
      <AndarForm
        title="Cadastrar andar"
        submitLabel="Cadastrar andar"
        submittingLabel="Salvando..."
        successMessage="Andar cadastrado com sucesso!"
        onSave={(data) =>
          createAndar({
            nome: data.nome,
            descricao: data.descricao || undefined,
          })
        }
      />
    </>
  );
}
