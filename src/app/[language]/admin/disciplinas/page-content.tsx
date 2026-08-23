"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Edit from "lucide-react/dist/esm/icons/edit";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { useGetDisciplinasService } from "@/services/api/services/disciplinas";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const getDisciplinas = useGetDisciplinasService();
  const { data: res, isLoading } = useQuery({
    queryKey: ["disciplinas"],
    queryFn: () => getDisciplinas(),
  });
  const disciplinas = res?.status === HTTP_CODES_ENUM.OK ? res.data.data : [];

  return (
    <>
      <AdminHeader
        title="Disciplinas"
        subtitle="Disciplinas cadastradas por curso"
      />

      <div className="p-6 max-w-[1000px] mx-auto w-full space-y-6">
        <div className="flex justify-end">
          <Link href="/admin/disciplinas/nova">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova disciplina
            </Button>
          </Link>
        </div>

        <DataTable
          data={disciplinas}
          isLoading={isLoading}
          getRowKey={(d) => d.id}
          searchValue={(d) => `${d.nome} ${d.curso.nome}`}
          searchPlaceholder="Buscar por disciplina ou curso..."
          pageSize={20}
          emptyState={{
            icon: <BookOpen className="w-8 h-8" />,
            title: "Nenhuma disciplina cadastrada",
            description:
              "Cadastre a primeira disciplina pra vincular às turmas e aulas.",
            action: (
              <Link href="/admin/disciplinas/nova">
                <Button>Nova disciplina</Button>
              </Link>
            ),
          }}
          columns={[
            {
              header: "Disciplina",
              cell: (d) => <span className="font-medium">{d.nome}</span>,
            },
            {
              header: "Curso",
              cell: (d) => (
                <span className="text-muted-foreground">{d.curso.nome}</span>
              ),
            },
            {
              header: "Ações",
              cell: (d) => (
                <Link href={`/admin/disciplinas/${d.id}/editar`}>
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
