"use client";

import { routes } from "@/routes";
import { PageContainer } from "@/components/layout/page-container";
import { TipoAmbienteEditDrawer } from "./tipoambiente-edit-drawer";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import Pencil from "lucide-react/dist/esm/icons/pencil";
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
  const [editingId, setEditingId] = useState<string | null>(null);
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

      <PageContainer className="space-y-6">
        <div className="flex justify-end">
          <Link href={routes.tiposAmbiente.admin.create()}>
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
              <Link href={routes.tiposAmbiente.admin.create()}>
                <Button>Cadastrar tipo</Button>
              </Link>
            ),
          }}
          rowActions={(b) => [
            {
              label: "Editar",
              icon: <Pencil className="size-4" />,
              onSelect: () => setEditingId(String(b.id)),
            },
            {
              label: "Excluir",
              icon: <Trash2 className="size-4" />,
              destructive: true,
              disabled: deleteMutation.isPending,
              onSelect: () => handleDelete(b),
            },
          ]}
          columns={[
            {
              header: "Nome",
              sortValue: (b) => b.nome,
              cell: (b) => <span className="font-medium">{b.nome}</span>,
            },
            {
              header: "Descrição",
              sortValue: (b) => b.descricao,
              cell: (b) => (
                <span className="text-muted-foreground">
                  {b.descricao || "-"}
                </span>
              ),
            },
          ]}
        />
      </PageContainer>

      <TipoAmbienteEditDrawer
        id={editingId}
        onClose={() => setEditingId(null)}
      />
    </>
  );
}
