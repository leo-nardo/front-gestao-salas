"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import Edit from "lucide-react/dist/esm/icons/edit";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Tags from "lucide-react/dist/esm/icons/tags";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import {
  useGetTipoAmbientesService,
  useDeleteTipoAmbienteService,
  type TipoAmbiente,
} from "@/services/api/services/tipo-ambientes";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const queryClient = useQueryClient();
  const { confirmDialog } = useConfirmDialog();
  const getTipoAmbientes = useGetTipoAmbientesService();
  const deleteTipoAmbiente = useDeleteTipoAmbienteService();

  const { data: tipoAmbientesRes, isLoading } = useQuery({
    queryKey: ["tipos-ambiente", { limit: 500 }],
    queryFn: () => getTipoAmbientes({ limit: "500" }),
  });

  const tipoAmbientes =
    tipoAmbientesRes?.status === HTTP_CODES_ENUM.OK
      ? tipoAmbientesRes.data.data
      : [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTipoAmbiente(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tipos-ambiente"] });
      toast.success("Tipo de ambiente excluído com sucesso!");
    },
    onError: () => {
      toast.error(
        "Não é possível excluir: existem ambientes usando este tipo."
      );
    },
  });

  const handleDelete = async (tipoAmbiente: TipoAmbiente) => {
    const confirmed = await confirmDialog({
      title: "Excluir tipo de ambiente",
      message: `Tem certeza que deseja excluir o tipo de ambiente "${tipoAmbiente.nome}"? Essa ação não pode ser desfeita.`,
      successButtonText: "Excluir",
      cancelButtonText: "Cancelar",
    });
    if (confirmed) {
      deleteMutation.mutate(tipoAmbiente.id);
    }
  };

  return (
    <>
      <AdminHeader
        title="Tipos de Ambiente"
        subtitle="Gerencie os tipos de ambiente disponíveis pra classificar os ambientes"
      />

      <div className="p-6 max-w-[1200px] mx-auto w-full space-y-6">
        <div className="flex justify-end">
          <Link href="/admin/tipos-ambiente/novo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo tipo
            </Button>
          </Link>
        </div>

        <DataTable
          data={tipoAmbientes}
          isLoading={isLoading}
          getRowKey={(b) => b.id}
          searchValue={(b) => `${b.nome} ${b.descricao ?? ""}`}
          searchPlaceholder="Buscar por nome..."
          emptyState={{
            icon: <Tags className="w-8 h-8" />,
            title: "Nenhum tipo de ambiente encontrado",
            description:
              "Cadastre o primeiro tipo de ambiente (ex: Sala comum, Laboratório).",
            action: (
              <Link href="/admin/tipos-ambiente/novo">
                <Button>Cadastrar tipo</Button>
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
                  <Link href={`/admin/tipos-ambiente/${b.id}/editar`}>
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
