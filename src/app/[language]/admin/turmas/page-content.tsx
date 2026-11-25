"use client";

import { PageContainer } from "@/components/layout/page-container";
import { TurmaEditDrawer } from "./turma-edit-drawer";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import Layers from "lucide-react/dist/esm/icons/layers";
import Pencil from "lucide-react/dist/esm/icons/pencil";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { useGetTurmasService } from "@/services/api/services/turmas";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const [editingId, setEditingId] = useState<string | null>(null);
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

      <PageContainer className="space-y-6">
        <div className="flex justify-end">
          <Link href="/admin/turmas/nova">
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
              <Link href="/admin/turmas/nova">
                <Button>Nova turma</Button>
              </Link>
            ),
          }}
          rowActions={(t) => [
            {
              label: "Editar",
              icon: <Pencil className="size-4" />,
              onSelect: () => setEditingId(String(t.id)),
            },
          ]}
          columns={[
            {
              header: "Código",
              sortValue: (t) => t.codigo,
              cell: (t) => (
                <span className="font-medium font-ibm-plex-mono">
                  {t.codigo}
                </span>
              ),
            },
            {
              header: "Curso",
              sortValue: (t) => t.curso?.nome,
              cell: (t) => (
                <span className="text-muted-foreground">{t.curso?.nome}</span>
              ),
            },
            {
              header: "Período",
              sortValue: (t) => t.periodo,
              cell: (t) => (
                <span className="text-muted-foreground">{t.periodo}</span>
              ),
            },
          ]}
        />
      </PageContainer>

      <TurmaEditDrawer id={editingId} onClose={() => setEditingId(null)} />
    </>
  );
}
