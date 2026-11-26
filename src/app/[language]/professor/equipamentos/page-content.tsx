"use client";

import { routes } from "@/routes";
import { PageContainer } from "@/components/layout/page-container";
import { useQuery } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import Package from "lucide-react/dist/esm/icons/package";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { useGetMinhasSolicitacaoEquipamentosService } from "@/services/api/services/solicitacao-equipamentos";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const statusBadge: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-warning-bg text-warning" },
  aprovada: { label: "Aprovada", className: "bg-success-bg text-success" },
  rejeitada: {
    label: "Rejeitada",
    className: "bg-destructive-bg text-destructive",
  },
  devolvida: {
    label: "Devolvida",
    className: "bg-secondary text-muted-foreground",
  },
};

export default function PageContent() {
  const getMinhas = useGetMinhasSolicitacaoEquipamentosService();
  const { data: res, isLoading } = useQuery({
    queryKey: ["minhas-solicitacoes-equipamento"],
    queryFn: () => getMinhas(),
  });
  const solicitacoes = res?.status === HTTP_CODES_ENUM.OK ? res.data : [];

  return (
    <PageContainer padded={false} className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground font-public-sans tracking-tight">
          Minhas solicitações de equipamento
        </h1>
        <Link href={routes.equipamentos.professor.create()}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Solicitar equipamento
          </Button>
        </Link>
      </div>

      <DataTable
        data={solicitacoes}
        isLoading={isLoading}
        getRowKey={(s) => s.id}
        searchValue={(s) => `${s.equipamento.nome} ${s.finalidade}`}
        searchPlaceholder="Buscar por equipamento ou finalidade..."
        enableColumnToggle
        emptyState={{
          icon: <Package className="w-8 h-8" />,
          title: "Nenhuma solicitação",
          description: "Você ainda não solicitou nenhum equipamento.",
          action: (
            <Link href={routes.equipamentos.professor.create()}>
              <Button>Solicitar equipamento</Button>
            </Link>
          ),
        }}
        columns={[
          {
            header: "Equipamento",
            sortValue: (s) => s.equipamento.nome,
            hideable: false,
            cell: (s) => (
              <span className="font-medium">{s.equipamento.nome}</span>
            ),
          },
          {
            header: "Quantidade",
            sortValue: (s) => s.quantidade,
            cell: (s) =>
              `${s.quantidade} ${s.quantidade === 1 ? "unidade" : "unidades"}`,
          },
          {
            header: "Período",
            sortValue: (s) => s.dataInicio,
            cell: (s) => (
              <span className="font-mono text-sm">
                {s.dataInicio} até {s.dataFim}
              </span>
            ),
          },
          {
            header: "Finalidade",
            className: "max-w-[260px]",
            cell: (s) => (
              <span
                className="line-clamp-2 text-sm text-muted-foreground"
                title={s.finalidade}
              >
                {s.finalidade}
              </span>
            ),
          },
          {
            header: "Status",
            sortValue: (s) => s.status,
            cell: (s) => {
              const badge = statusBadge[s.status];
              return (
                <Badge className={`${badge.className} border-transparent`}>
                  {badge.label}
                </Badge>
              );
            },
          },
          {
            header: "Resposta",
            cell: (s) => (
              <span className="text-sm text-muted-foreground">
                {s.motivoResposta || "—"}
              </span>
            ),
          },
        ]}
      />
    </PageContainer>
  );
}
