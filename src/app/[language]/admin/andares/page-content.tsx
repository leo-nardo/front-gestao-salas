"use client";

import { routes } from "@/routes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import Edit from "lucide-react/dist/esm/icons/edit";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Layers from "lucide-react/dist/esm/icons/layers";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import {
  useGetAndaresService,
  useDeleteAndarService,
  type Andar,
} from "@/services/api/services/andares";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const queryClient = useQueryClient();
  const { confirmDialog } = useConfirmDialog();
  const getAndares = useGetAndaresService();
  const deleteAndar = useDeleteAndarService();

  const { data: andarsRes, isLoading } = useQuery({
    queryKey: ["andares", { limit: 500 }],
    queryFn: () => getAndares({ limit: "500" }),
  });

  const andares =
    andarsRes?.status === HTTP_CODES_ENUM.OK ? andarsRes.data.data : [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAndar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["andares"] });
      toast.success("Andar excluído com sucesso!");
    },
    onError: () => {
      toast.error(
        "Não é possível excluir: existem ambientes usando este andar."
      );
    },
  });

  const handleDelete = async (andar: Andar) => {
    const confirmed = await confirmDialog({
      title: "Excluir andar",
      message: `Tem certeza que deseja excluir o andar "${andar.nome}"? Essa ação não pode ser desfeita.`,
      successButtonText: "Excluir",
      cancelButtonText: "Cancelar",
    });
    if (confirmed) {
      deleteMutation.mutate(andar.id);
    }
  };

  return (
    <>
      <AdminHeader
        title="Andares"
        subtitle="Gerencie os andares (pavimentos) usados pelos ambientes"
      />

      <div className="p-6 max-w-[1200px] mx-auto w-full space-y-6">
        <div className="flex justify-end">
          <Link href={routes.andares.admin.create()}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo andar
            </Button>
          </Link>
        </div>

        <DataTable
          data={andares}
          isLoading={isLoading}
          getRowKey={(b) => b.id}
          searchValue={(b) => `${b.nome} ${b.descricao ?? ""}`}
          searchPlaceholder="Buscar por nome..."
          emptyState={{
            icon: <Layers className="w-8 h-8" />,
            title: "Nenhum andar encontrado",
            description:
              "Cadastre o primeiro andar pra começar a organizar os ambientes por pavimento.",
            action: (
              <Link href={routes.andares.admin.create()}>
                <Button>Cadastrar andar</Button>
              </Link>
            ),
          }}
          columns={[
            {
              header: "Nome",
              cell: (b) => <span className="font-medium">{b.nome}</span>,
            },
            {
              header: "Descrição",
              cell: (b) => (
                <span className="text-muted-foreground">
                  {b.descricao || "-"}
                </span>
              ),
            },
            {
              header: "Ações",
              cell: (b) => (
                <div className="flex items-center gap-2">
                  <Link href={routes.andares.admin.edit(b.id)}>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(b)}
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
