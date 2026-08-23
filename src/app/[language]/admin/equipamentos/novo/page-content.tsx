"use client";

import { AdminHeader } from "@/components/admin-header";
import { useCreateEquipamentoService } from "@/services/api/services/equipamentos";
import { EquipamentoForm } from "../equipamento-form";

export default function PageContent() {
  const createEquipamento = useCreateEquipamentoService();

  return (
    <>
      <AdminHeader title="Novo Equipamento" />
      <EquipamentoForm
        title="Novo equipamento"
        submitLabel="Salvar equipamento"
        submittingLabel="Salvando..."
        successMessage="Equipamento criado com sucesso!"
        onSave={(data) =>
          createEquipamento({
            nome: data.nome,
            tipo: data.tipo,
            unidade: { id: data.unidadeId },
            quantidadeTotal: data.quantidadeTotal,
            quantidadeDisponivel: data.quantidadeTotal,
            descricao: data.descricao,
          })
        }
      />
    </>
  );
}
