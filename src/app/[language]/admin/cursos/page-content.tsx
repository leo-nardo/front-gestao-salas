"use client";

import { routes } from "@/routes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import Edit from "lucide-react/dist/esm/icons/edit";
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

      <div className="p-6 max-w-[1000px] mx-auto w-full space-y-6">
        <div className="flex justify-end">
          <Link href={routes.cursos.admin.create()}>
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
              <Link href={routes.cursos.admin.create()}>
                <Button>Cadastrar curso</Button>
              </Link>
            ),
          }}
          columns={[
            {
              header: "Nome",
              cell: (c) => <span className="font-medium">{c.nome}</span>,
            },
            {
              header: "Ações",
              cell: (c) => (
                <div className="flex items-center gap-2">
                  <Link href={routes.cursos.admin.edit(c.id)}>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(c)}
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
