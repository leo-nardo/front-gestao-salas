"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "@/components/link";
import Edit from "lucide-react/dist/esm/icons/edit";
import Plus from "lucide-react/dist/esm/icons/plus";
import Package from "lucide-react/dist/esm/icons/package";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { useGetEquipamentosService } from "@/services/api/services/equipamentos";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const getEquipamentos = useGetEquipamentosService();
  const { data: res, isLoading } = useQuery({
    queryKey: ["equipamentos"],
    queryFn: () => getEquipamentos(),
  });
  const equipamentos = res?.status === HTTP_CODES_ENUM.OK ? res.data.data : [];

  return (
    <>
      <AdminHeader
        title="Equipamentos"
        subtitle="Gerencie o acervo de equipamentos emprestáveis"
      />

      <div className="p-6 max-w-[1100px] mx-auto w-full space-y-6">
        <div className="flex justify-end">
          <Link href="/admin/equipamentos/novo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo equipamento
            </Button>
          </Link>
        </div>

        <DataTable
          data={equipamentos}
          isLoading={isLoading}
          getRowKey={(eq) => eq.id}
          searchValue={(eq) =>
            `${eq.nome} ${eq.tipo} ${eq.unidade?.nome ?? ""}`
          }
          searchPlaceholder="Buscar por nome, tipo ou unidade..."
          enableColumnToggle
          emptyState={{
            icon: <Package className="w-8 h-8" />,
            title: "Nenhum equipamento cadastrado",
            description: "Cadastre o primeiro equipamento pra começar.",
            action: (
              <Link href="/admin/equipamentos/novo">
                <Button>Cadastrar primeiro equipamento</Button>
              </Link>
            ),
          }}
          columns={[
            {
              header: "Nome",
              sortValue: (eq) => eq.nome,
              hideable: false,
              cell: (eq) => <span className="font-medium">{eq.nome}</span>,
            },
            {
              header: "Tipo",
              sortValue: (eq) => eq.tipo,
              cell: (eq) => <Badge variant="outline">{eq.tipo}</Badge>,
            },
            {
              header: "Unidade",
              sortValue: (eq) => eq.unidade?.nome,
              cell: (eq) => eq.unidade?.nome ?? "—",
            },
            {
              header: "Disponível",
              sortValue: (eq) => eq.quantidadeDisponivel,
              cell: (eq) => (
                <span className="font-ibm-plex-mono font-semibold">
                  {eq.quantidadeDisponivel} / {eq.quantidadeTotal}
                </span>
              ),
            },
            {
              header: "Ações",
              hideable: false,
              cell: (eq) => (
                <Link href={`/admin/equipamentos/${eq.id}/editar`}>
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
