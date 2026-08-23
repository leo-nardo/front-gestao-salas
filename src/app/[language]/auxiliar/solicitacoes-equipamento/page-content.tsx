"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Package from "lucide-react/dist/esm/icons/package";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
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

      <div className="p-6 max-w-[900px] mx-auto w-full">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : solicitacoes.length === 0 ? (
          <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center bg-muted/30">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhuma solicitação
            </h3>
          </div>
        ) : (
          <div className="space-y-4">
            {solicitacoes.map((s) => {
              const badge = statusBadge[s.status];
              return (
                <Card key={s.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">
                        {s.equipamento.nome} ({s.quantidade}{" "}
                        {s.quantidade === 1 ? "unidade" : "unidades"})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Solicitante: {s.solicitante.firstName}{" "}
                        {s.solicitante.lastName}
                      </p>
                    </div>
                    <Badge className={`${badge.className} border-transparent`}>
                      {badge.label}
                    </Badge>
                  </div>

                  <div className="text-sm text-foreground mb-2">
                    <span className="text-muted-foreground">Período:</span>{" "}
                    {s.dataInicio} até {s.dataFim}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    <span className="text-muted-foreground">Finalidade:</span>{" "}
                    &ldquo;{s.finalidade}&rdquo;
                  </p>

                  {s.status === "pendente" ? (
                    <div className="space-y-3 pt-3 border-t">
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
                    </div>
                  ) : s.status === "aprovada" ? (
                    <div className="flex justify-end pt-3 border-t">
                      <Button
                        variant="outline"
                        disabled={devolverMutation.isPending}
                        onClick={() => devolverMutation.mutate(s.id)}
                      >
                        Marcar como devolvida
                      </Button>
                    </div>
                  ) : (
                    s.motivoResposta && (
                      <p className="text-sm text-muted-foreground pt-3 border-t">
                        Resposta: {s.motivoResposta}
                      </p>
                    )
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
