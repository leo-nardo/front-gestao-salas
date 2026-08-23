"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import Edit from "lucide-react/dist/esm/icons/edit";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import {
  useGetBlocosService,
  useDeleteBlocoService,
  type Bloco,
} from "@/services/api/services/blocos";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const queryClient = useQueryClient();
  const { confirmDialog } = useConfirmDialog();
  const getBlocos = useGetBlocosService();
  const deleteBloco = useDeleteBlocoService();

  const { data: blocosRes, isLoading } = useQuery({
    queryKey: ["blocos", { limit: 500 }],
    queryFn: () => getBlocos({ limit: "500" }),
  });

  const blocos =
    blocosRes?.status === HTTP_CODES_ENUM.OK ? blocosRes.data.data : [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBloco(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocos"] });
      toast.success("Bloco excluído com sucesso!");
    },
    onError: () => {
      toast.error(
        "Não é possível excluir: existem ambientes usando este bloco."
      );
    },
  });

  const handleDelete = async (bloco: Bloco) => {
    const confirmed = await confirmDialog({
      title: "Excluir bloco",
      message: `Tem certeza que deseja excluir o bloco "${bloco.nome}"? Essa ação não pode ser desfeita.`,
      successButtonText: "Excluir",
      cancelButtonText: "Cancelar",
    });
    if (confirmed) {
      deleteMutation.mutate(bloco.id);
    }
  };

  return (
    <>
      <AdminHeader
        title="Blocos"
        subtitle="Gerencie os blocos/prédios usados pelos ambientes"
      />

      <div className="p-6 max-w-[1200px] mx-auto w-full space-y-6">
        <div className="flex justify-end">
          <Link href="/admin/blocos/novo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo bloco
            </Button>
          </Link>
        </div>

        <DataTable
          data={blocos}
          isLoading={isLoading}
          getRowKey={(b) => b.id}
          searchValue={(b) => `${b.nome} ${b.descricao ?? ""}`}
          searchPlaceholder="Buscar por nome..."
          emptyState={{
            icon: <Building2 className="w-8 h-8" />,
            title: "Nenhum bloco encontrado",
            description:
              "Cadastre o primeiro bloco pra começar a organizar os ambientes por prédio.",
            action: (
              <Link href="/admin/blocos/novo">
                <Button>Cadastrar bloco</Button>
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
                  <Link href={`/admin/blocos/${b.id}/editar`}>
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
