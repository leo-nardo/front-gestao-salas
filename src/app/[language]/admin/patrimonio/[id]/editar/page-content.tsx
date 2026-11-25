"use client";

import { routes } from "@/routes";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AdminHeader } from "@/components/admin-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetItemPatrimonialService,
  useUpdateItemPatrimonialService,
} from "@/services/api/services/item-patrimonials";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { PatrimonioForm } from "../../patrimonio-form";

export default function PageContent({ id }: { id: string }) {
  const router = useRouter();
  const getItem = useGetItemPatrimonialService();
  const updateItem = useUpdateItemPatrimonialService();

  const { data: res, isLoading } = useQuery({
    queryKey: ["item-patrimoniais", id],
    queryFn: () => getItem({ id }),
  });

  const item = res?.status === HTTP_CODES_ENUM.OK ? res.data : null;

  return (
    <>
      <AdminHeader title="Editar Item Patrimonial" />

      {isLoading || !item ? (
        <div className="p-6 max-w-[600px] mx-auto w-full space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      ) : (
        <PatrimonioForm
          title="Editar item"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Item patrimonial atualizado com sucesso!"
          backHref={routes.patrimonio.admin.list()}
          defaultValues={{
            nome: item.nome,
            tipo: item.tipo,
            ambienteId: item.ambiente?.id || "",
            numeroPatrimonio: item.numeroPatrimonio || "",
            estado: item.estado,
          }}
          onSave={(data) =>
            updateItem({
              id,
              nome: data.nome,
              tipo: data.tipo,
              ambiente: { id: data.ambienteId },
              numeroPatrimonio: data.numeroPatrimonio || null,
              estado: data.estado,
            })
          }
          onSaved={() => router.push(routes.patrimonio.admin.list())}
        />
      )}
    </>
  );
}
