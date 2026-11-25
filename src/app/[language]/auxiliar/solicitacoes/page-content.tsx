"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import ArrowLeftRight from "lucide-react/dist/esm/icons/arrow-left-right";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { useGetMinhasSolicitacoesService } from "@/services/api/services/solicitacao-troca-salas";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const statusBadge: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-warning-bg text-warning" },
  aprovada: { label: "Aprovada", className: "bg-success-bg text-success" },
  rejeitada: {
    label: "Rejeitada",
    className: "bg-destructive-bg text-destructive",
  },
};

export default function PageContent() {
  const getMinhas = useGetMinhasSolicitacoesService();
  const { data: res, isLoading } = useQuery({
    queryKey: ["minhas-solicitacoes"],
    queryFn: () => getMinhas(),
  });
  const solicitacoes = res?.status === HTTP_CODES_ENUM.OK ? res.data : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground font-public-sans tracking-tight">
          Minhas solicitações de troca
        </h1>
        <Link href="/auxiliar/solicitacoes/nova">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova solicitação
          </Button>
        </Link>
      </div>

      <DataTable
        data={solicitacoes}
        isLoading={isLoading}
        getRowKey={(s) => s.id}
        searchValue={(s) =>
          `${s.aula.disciplina.nome} ${s.aula.turma.codigo} ${s.ambienteAtual.nome} ${s.justificativa}`
        }
        searchPlaceholder="Buscar por disciplina, turma ou ambiente..."
        enableColumnToggle
        emptyState={{
          icon: <ArrowLeftRight className="w-8 h-8" />,
          title: "Nenhuma solicitação",
          description:
            "Você ainda não fez nenhuma solicitação de troca de sala.",
          action: (
            <Link href="/auxiliar/solicitacoes/nova">
              <Button>Nova solicitação</Button>
            </Link>
          ),
        }}
        columns={[
          {
            header: "Aula",
            sortValue: (s) => s.aula.disciplina.nome,
            hideable: false,
            cell: (s) => (
              <div>
                <p className="font-medium">
                  {s.aula.disciplina.nome} · {s.aula.turma.codigo}
                </p>
                <p className="text-xs text-muted-foreground">
                  {s.aula.diaSemana} {s.aula.horarioInicio}-{s.aula.horarioFim}
                </p>
              </div>
            ),
          },
          {
            header: "Ambiente",
            sortValue: (s) => s.ambienteAtual.nome,
            cell: (s) => (
              <div className="text-sm">
                <span>{s.ambienteAtual.nome}</span>
                {s.ambienteSugerido && (
                  <p className="text-xs text-muted-foreground">
                    → Sugestão: {s.ambienteSugerido.nome}
                  </p>
                )}
              </div>
            ),
          },
          {
            header: "Justificativa",
            className: "max-w-[260px]",
            cell: (s) => (
              <span
                className="line-clamp-2 text-sm text-muted-foreground"
                title={s.justificativa}
              >
                {s.justificativa}
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
    </div>
  );
}
