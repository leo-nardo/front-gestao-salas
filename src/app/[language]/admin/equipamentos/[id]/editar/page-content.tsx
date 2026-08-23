"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminHeader } from "@/components/admin-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetEquipamentoService,
  useUpdateEquipamentoService,
} from "@/services/api/services/equipamentos";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { EquipamentoForm } from "../../equipamento-form";

export default function PageContent({ id }: { id: string }) {
  const getEquipamento = useGetEquipamentoService();
  const updateEquipamento = useUpdateEquipamentoService();

  const { data: res, isLoading } = useQuery({
    queryKey: ["equipamentos", id],
    queryFn: () => getEquipamento(id),
  });

  const equipamento = res?.status === HTTP_CODES_ENUM.OK ? res.data : null;

  return (
    <>
      <AdminHeader title="Editar Equipamento" />

      {isLoading || !equipamento ? (
        <div className="p-6 max-w-[700px] mx-auto w-full space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      ) : (
        <EquipamentoForm
          title="Editar equipamento"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Equipamento atualizado com sucesso!"
          defaultValues={{
            nome: equipamento.nome,
            tipo: equipamento.tipo,
            unidadeId: equipamento.unidade?.id || "",
            quantidadeTotal: equipamento.quantidadeTotal,
            descricao: equipamento.descricao || "",
          }}
          onSave={(data) =>
            updateEquipamento(id, {
              nome: data.nome,
              tipo: data.tipo,
              unidade: { id: data.unidadeId },
              quantidadeTotal: data.quantidadeTotal,
              descricao: data.descricao,
            })
          }
        />
      )}
    </>
  );
}
