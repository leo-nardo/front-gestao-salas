"use client";

import { PageContainer } from "@/components/layout/page-container";
import { CursoEditDrawer } from "./curso-edit-drawer";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import Pencil from "lucide-react/dist/esm/icons/pencil";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import GraduationCap from "lucide-react/dist/esm/icons/graduation-cap";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import {
  useGetCursosService,
  useDeleteCursoService,
  type Curso,
} from "@/services/api/services/cursos";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { confirmDialog } = useConfirmDialog();
  const getCursos = useGetCursosService();
  const deleteCurso = useDeleteCursoService();

  const { data: cursosRes, isLoading } = useQuery({
    queryKey: ["cursos"],
    queryFn: () => getCursos(),
  });

  const cursos = cursosRes?.status === HTTP_CODES_ENUM.OK ? cursosRes.data : [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCurso(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cursos"] });
      toast.success("Curso excluído com sucesso!");
    },
    onError: () => {
      toast.error(
        "Não é possível excluir: existem disciplinas ou turmas usando este curso."
      );
    },
  });

  const handleDelete = async (curso: Curso) => {
    const confirmed = await confirmDialog({
      title: "Excluir curso",
      message: `Tem certeza que deseja excluir o curso "${curso.nome}"? Essa ação não pode ser desfeita.`,
      successButtonText: "Excluir",
      cancelButtonText: "Cancelar",
    });
    if (confirmed) {
      deleteMutation.mutate(curso.id);
    }
  };

  return (
    <>
      <AdminHeader
        title="Cursos"
        subtitle="Gerencie os cursos oferecidos pela instituição"
      />

      <PageContainer className="space-y-6">
        <div className="flex justify-end">
          <Link href="/admin/cursos/novo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo curso
            </Button>
          </Link>
        </div>

        <DataTable
          data={cursos}
          isLoading={isLoading}
          getRowKey={(c) => c.id}
          searchValue={(c) => c.nome}
          searchPlaceholder="Buscar por nome..."
          emptyState={{
            icon: <GraduationCap className="w-8 h-8" />,
            title: "Nenhum curso encontrado",
            description: "Cadastre o primeiro curso pra começar.",
            action: (
              <Link href="/admin/cursos/novo">
                <Button>Cadastrar curso</Button>
              </Link>
            ),
          }}
          rowActions={(c) => [
            {
              label: "Editar",
              icon: <Pencil className="size-4" />,
              onSelect: () => setEditingId(String(c.id)),
            },
            {
              label: "Excluir",
              icon: <Trash2 className="size-4" />,
              destructive: true,
              disabled: deleteMutation.isPending,
              onSelect: () => handleDelete(c),
            },
          ]}
          columns={[
            {
              header: "Nome",
              sortValue: (c) => c.nome,
              cell: (c) => <span className="font-medium">{c.nome}</span>,
            },
          ]}
        />
      </PageContainer>

      <CursoEditDrawer id={editingId} onClose={() => setEditingId(null)} />
    </>
  );
}
