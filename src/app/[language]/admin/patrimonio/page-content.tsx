"use client";

import { routes, withQuery } from "@/routes";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import Edit from "lucide-react/dist/esm/icons/edit";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import ClipboardList from "lucide-react/dist/esm/icons/clipboard-list";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { toast } from "sonner";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetItemPatrimonialsService,
  useDeleteItemPatrimonialService,
  type ItemPatrimonial,
} from "@/services/api/services/item-patrimonials";
import { useGetAmbientesService } from "@/services/api/services/ambientes";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const estadoBadge: Record<string, { label: string; className: string }> = {
  funcionando: {
    label: "Funcionando",
    className: "bg-success-bg text-success",
  },
  com_defeito: {
    label: "Com defeito",
    className: "bg-destructive-bg text-destructive",
  },
  em_manutencao: {
    label: "Em manutenção",
    className: "bg-warning-bg text-warning",
  },
};

export default function PageContent() {
  const queryClient = useQueryClient();
  const { confirmDialog } = useConfirmDialog();
  const searchParams = useSearchParams();
  const defaultAmbiente = searchParams.get("ambiente");

  const [ambienteFiltro, setAmbienteFiltro] = useState<string>(
    defaultAmbiente || "todos"
  );

  const getItens = useGetItemPatrimonialsService();
  const getAmbientes = useGetAmbientesService();
  const deleteItem = useDeleteItemPatrimonialService();

  const { data: itensRes, isLoading: isLoadingItens } = useQuery({
    queryKey: ["item-patrimoniais", { limit: 500 }],
    queryFn: () => getItens({ limit: 500 }),
  });

  const { data: ambientesRes } = useQuery({
    queryKey: ["ambientes", { limit: "500" }],
    queryFn: () => getAmbientes({ limit: "500" }),
  });

  const itens =
    itensRes?.status === HTTP_CODES_ENUM.OK ? itensRes.data.data : [];
  const ambientes =
    ambientesRes?.status === HTTP_CODES_ENUM.OK ? ambientesRes.data.data : [];

  const filteredItens = itens.filter((item) =>
    ambienteFiltro === "todos" ? true : item.ambiente.id === ambienteFiltro
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteItem({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-patrimoniais"] });
      toast.success("Item patrimonial excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir item patrimonial.");
    },
  });

  const handleDelete = async (item: ItemPatrimonial) => {
    const confirmed = await confirmDialog({
      title: "Excluir item patrimonial",
      message: `Tem certeza que deseja excluir "${item.nome}"? Essa ação não pode ser desfeita.`,
      successButtonText: "Excluir",
      cancelButtonText: "Cancelar",
    });
    if (confirmed) {
      deleteMutation.mutate(item.id);
    }
  };

  return (
    <>
      <AdminHeader
        title="Patrimônio"
        subtitle="Gerencie os itens patrimoniais e equipamentos das salas"
      />

      <div className="p-6 max-w-[1200px] mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="w-full md:w-[300px]">
            <Select value={ambienteFiltro} onValueChange={setAmbienteFiltro}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por ambiente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os ambientes</SelectItem>
                {ambientes.map((amb) => (
                  <SelectItem key={amb.id} value={amb.id}>
                    {amb.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link
            href={withQuery(routes.patrimonio.admin.create(), {
              ambiente: ambienteFiltro !== "todos" ? ambienteFiltro : null,
            })}
          >
            <Button className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Novo item
            </Button>
          </Link>
        </div>

        <DataTable
          data={filteredItens}
          isLoading={isLoadingItens}
          getRowKey={(item) => item.id}
          searchValue={(item) =>
            `${item.nome} ${item.tipo} ${item.numeroPatrimonio ?? ""}`
          }
          searchPlaceholder="Buscar por nome, tipo ou nº de patrimônio..."
          emptyState={{
            icon: <ClipboardList className="w-8 h-8" />,
            title: "Nenhum item patrimonial encontrado",
            action: (
              <Link href={routes.patrimonio.admin.create()}>
                <Button>Cadastrar item</Button>
              </Link>
            ),
          }}
          columns={[
            {
              header: "Nome",
              cell: (item) => <span className="font-medium">{item.nome}</span>,
            },
            {
              header: "Tipo",
              cell: (item) => (
                <span className="text-muted-foreground">{item.tipo}</span>
              ),
            },
            {
              header: "Ambiente",
              cell: (item) => (
                <span className="text-muted-foreground">
                  {item.ambiente.nome}
                </span>
              ),
            },
            {
              header: "Nº Patrimônio",
              cell: (item) => (
                <span className="text-muted-foreground">
                  {item.numeroPatrimonio || "-"}
                </span>
              ),
            },
            {
              header: "Estado",
              cell: (item) => {
                const badge =
                  estadoBadge[item.estado] || estadoBadge.funcionando;
                return (
                  <Badge className={`${badge.className} border-transparent`}>
                    {badge.label}
                  </Badge>
                );
              },
            },
            {
              header: "Ações",
              cell: (item) => (
                <div className="flex items-center gap-2">
                  <Link href={routes.patrimonio.admin.edit(item.id)}>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item)}
                    disabled={deleteMutation.isPending}
                    className="text-destructive hover:bg-destructive-bg hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Excluir
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </>
  );
}
