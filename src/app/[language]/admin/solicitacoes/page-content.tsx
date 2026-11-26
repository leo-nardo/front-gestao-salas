"use client";

import { PageContainer } from "@/components/layout/page-container";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ArrowLeftRight from "lucide-react/dist/esm/icons/arrow-left-right";
import MessageSquareReply from "lucide-react/dist/esm/icons/message-square-reply";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DataTable } from "@/components/data-table";
import {
  useGetSolicitacaoTrocaSalasService,
  useResponderSolicitacaoService,
} from "@/services/api/services/solicitacao-troca-salas";
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
  const queryClient = useQueryClient();
  const getSolicitacoes = useGetSolicitacaoTrocaSalasService();
  const responder = useResponderSolicitacaoService();
  const [motivos, setMotivos] = useState<Record<string, string>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ["solicitacoes-troca-sala"],
    queryFn: () => getSolicitacoes(),
  });
  const solicitacoes = res?.status === HTTP_CODES_ENUM.OK ? res.data.data : [];

  const responderMutation = useMutation({
    mutationFn: (vars: { id: string; status: "aprovada" | "rejeitada" }) =>
      responder({
        id: vars.id,
        status: vars.status,
        motivoResposta: motivos[vars.id],
      }),
    onSuccess: () => {
      setOpenId(null);
      queryClient.invalidateQueries({ queryKey: ["solicitacoes-troca-sala"] });
    },
  });

  return (
    <>
      <AdminHeader
        title="Solicitações de troca de sala"
        subtitle="Aprove ou rejeite pedidos de troca feitos pelos auxiliares"
      />

      <PageContainer className="space-y-6">
        <DataTable
          data={solicitacoes}
          isLoading={isLoading}
          getRowKey={(s) => s.id}
          searchValue={(s) =>
            `${s.aula.disciplina.nome} ${s.aula.turma.codigo} ${s.ambienteAtual.nome} ${s.solicitante.firstName} ${s.solicitante.lastName} ${s.justificativa}`
          }
          searchPlaceholder="Buscar por disciplina, turma, ambiente ou solicitante..."
          enableColumnToggle
          emptyState={{
            icon: <ArrowLeftRight className="w-8 h-8" />,
            title: "Nenhuma solicitação",
            description: "Os pedidos de troca dos auxiliares aparecem aqui.",
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
                    {s.aula.diaSemana} {s.aula.horarioInicio}-
                    {s.aula.horarioFim}
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
              header: "Solicitante",
              sortValue: (s) =>
                `${s.solicitante.firstName} ${s.solicitante.lastName}`,
              cell: (s) => (
                <span className="text-muted-foreground">
                  {s.solicitante.firstName} {s.solicitante.lastName}
                </span>
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
              defaultHidden: true,
              cell: (s) => (
                <span className="text-sm text-muted-foreground">
                  {s.motivoResposta || "—"}
                </span>
              ),
            },
            {
              header: "Ações",
              align: "right",
              hideable: false,
              cell: (s) =>
                s.status === "pendente" ? (
                  <Popover
                    open={openId === s.id}
                    onOpenChange={(open) => setOpenId(open ? s.id : null)}
                  >
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MessageSquareReply className="w-3.5 h-3.5 mr-1" />
                        Responder
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-80 space-y-3">
                      <Textarea
                        placeholder="Comentário opcional (motivo da resposta)"
                        className="text-sm"
                        value={motivos[s.id] || ""}
                        onChange={(e) =>
                          setMotivos((prev) => ({
                            ...prev,
                            [s.id]: e.target.value,
                          }))
                        }
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          disabled={responderMutation.isPending}
                          onClick={() =>
                            responderMutation.mutate({
                              id: s.id,
                              status: "rejeitada",
                            })
                          }
                        >
                          Rejeitar
                        </Button>
                        <Button
                          size="sm"
                          disabled={responderMutation.isPending}
                          onClick={() =>
                            responderMutation.mutate({
                              id: s.id,
                              status: "aprovada",
                            })
                          }
                        >
                          Aprovar
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                ),
            },
          ]}
        />
      </PageContainer>
    </>
  );
}
