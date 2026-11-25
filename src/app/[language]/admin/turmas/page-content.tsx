"use client";

import { routes } from "@/routes";
import { useQuery } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import Layers from "lucide-react/dist/esm/icons/layers";
import Edit from "lucide-react/dist/esm/icons/edit";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { useGetTurmasService } from "@/services/api/services/turmas";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const getTurmas = useGetTurmasService();
  const { data: res, isLoading } = useQuery({
    queryKey: ["turmas"],
    queryFn: () => getTurmas(),
  });
  const turmas = res?.status === HTTP_CODES_ENUM.OK ? res.data.data : [];

  return (
    <>
      <AdminHeader
        title="Turmas"
        subtitle="Turmas cadastradas por curso e período"
      />

      <div className="p-6 max-w-[1000px] mx-auto w-full space-y-6">
        <div className="flex justify-end">
          <Link href={routes.turmas.admin.create()}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova turma
            </Button>
          </Link>
        </div>

        <DataTable
          data={turmas}
          isLoading={isLoading}
          getRowKey={(t) => t.id}
          searchValue={(t) => `${t.codigo} ${t.curso?.nome} ${t.periodo}`}
          searchPlaceholder="Buscar por código ou curso..."
          pageSize={20}
          emptyState={{
            icon: <Layers className="w-8 h-8" />,
            title: "Nenhuma turma cadastrada",
            description: "Cadastre a primeira turma pra vincular às aulas.",
            action: (
              <Link href={routes.turmas.admin.create()}>
                <Button>Nova turma</Button>
              </Link>
            ),
          }}
          columns={[
            {
              header: "Código",
              cell: (t) => (
                <span className="font-medium font-ibm-plex-mono">
                  {t.codigo}
                </span>
              ),
            },
            {
              header: "Curso",
              cell: (t) => (
                <span className="text-muted-foreground">{t.curso?.nome}</span>
              ),
            },
            {
              header: "Período",
              cell: (t) => (
                <span className="text-muted-foreground">{t.periodo}</span>
              ),
            },
            {
              header: "Ações",
              cell: (t) => (
                <Link href={routes.turmas.admin.edit(t.id)}>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Editar
                  </Button>
                </Link>
              ),
            },
          ]}
        />
      </div>
    </>
  );
}
