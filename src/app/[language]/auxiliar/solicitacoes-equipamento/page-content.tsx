"use client";

import { PageContainer } from "@/components/layout/page-container";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Package from "lucide-react/dist/esm/icons/package";
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
  useGetSolicitacaoEquipamentosService,
  useResponderSolicitacaoEquipamentoService,
  useDevolverSolicitacaoEquipamentoService,
} from "@/services/api/services/solicitacao-equipamentos";
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
  const queryClient = useQueryClient();
  const getSolicitacoes = useGetSolicitacaoEquipamentosService();
  const responder = useResponderSolicitacaoEquipamentoService();
  const devolver = useDevolverSolicitacaoEquipamentoService();
  const [motivos, setMotivos] = useState<Record<string, string>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ["solicitacoes-equipamento"],
    queryFn: () => getSolicitacoes({ limit: 500 }),
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
      queryClient.invalidateQueries({ queryKey: ["solicitacoes-equipamento"] });
    },
  });

  const devolverMutation = useMutation({
    mutationFn: (id: string) => devolver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitacoes-equipamento"] });
    },
  });

  return (
    <>
      <AdminHeader
        title="Solicitações de Equipamento"
        subtitle="Gerencie pedidos de empréstimo de equipamentos"
      />

      <PageContainer className="space-y-6">
        <DataTable
          data={solicitacoes}
          isLoading={isLoading}
          getRowKey={(s) => s.id}
          searchValue={(s) =>
            `${s.equipamento.nome} ${s.solicitante.firstName} ${s.solicitante.lastName} ${s.finalidade}`
          }
          searchPlaceholder="Buscar por equipamento, solicitante ou finalidade..."
          enableColumnToggle
          emptyState={{
            icon: <Package className="w-8 h-8" />,
            title: "Nenhuma solicitação",
            description: "Os pedidos de empréstimo aparecem aqui.",
          }}
          columns={[
            {
              header: "Equipamento",
              sortValue: (s) => s.equipamento.nome,
              hideable: false,
              cell: (s) => (
                <div>
                  <p className="font-medium">{s.equipamento.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.quantidade} {s.quantidade === 1 ? "unidade" : "unidades"}
                  </p>
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
              className: "max-w-[240px]",
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
              cell: (s) => {
                if (s.status === "pendente") {
                  return (
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
                  );
                }
                if (s.status === "aprovada") {
                  return (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={devolverMutation.isPending}
                      onClick={() => devolverMutation.mutate(s.id)}
                    >
                      Marcar como devolvida
                    </Button>
                  );
                }
                return <span className="text-sm text-muted-foreground">—</span>;
              },
            },
          ]}
        />
      </PageContainer>
    </>
  );
}
