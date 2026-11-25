"use client";

import { PageContainer } from "@/components/layout/page-container";
import { useQuery } from "@tanstack/react-query";
import Package from "lucide-react/dist/esm/icons/package";
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
    <PageContainer padded={false} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground font-public-sans tracking-tight">
          Equipamentos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acervo de equipamentos audiovisuais e sua disponibilidade
        </p>
      </div>

      <DataTable
        data={equipamentos}
        isLoading={isLoading}
        getRowKey={(eq) => eq.id}
        searchValue={(eq) => `${eq.nome} ${eq.tipo} ${eq.unidade?.nome ?? ""}`}
        searchPlaceholder="Buscar por nome, tipo ou unidade..."
        enableColumnToggle
        emptyState={{
          icon: <Package className="w-8 h-8" />,
          title: "Nenhum equipamento cadastrado",
          description: "Não há equipamentos cadastrados no sistema no momento.",
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
            cell: (eq) => (
              <Badge variant="outline" className="text-muted-foreground">
                {eq.tipo}
              </Badge>
            ),
          },
          {
            header: "Unidade",
            sortValue: (eq) => eq.unidade?.nome,
            cell: (eq) => eq.unidade?.nome ?? "—",
          },
          {
            header: "Disponibilidade",
            sortValue: (eq) => eq.quantidadeDisponivel,
            cell: (eq) => (
              <span className="font-ibm-plex-mono text-sm font-semibold">
                {eq.quantidadeDisponivel} de {eq.quantidadeTotal} disponíveis
              </span>
            ),
          },
          {
            header: "Descrição",
            defaultHidden: true,
            className: "max-w-[280px]",
            cell: (eq) => (
              <span className="line-clamp-2 text-xs text-muted-foreground">
                {eq.descricao || "—"}
              </span>
            ),
          },
        ]}
      />
    </PageContainer>
  );
}
