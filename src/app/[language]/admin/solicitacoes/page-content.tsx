"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ArrowLeftRight from "lucide-react/dist/esm/icons/arrow-left-right";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
      queryClient.invalidateQueries({ queryKey: ["solicitacoes-troca-sala"] });
    },
  });

  return (
    <>
      <AdminHeader
        title="Solicitações de troca de sala"
        subtitle="Aprove ou rejeite pedidos de troca feitos pelos auxiliares"
      />

      <div className="p-6 max-w-[900px] mx-auto w-full">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : solicitacoes.length === 0 ? (
          <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center bg-muted/30">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
              <ArrowLeftRight className="w-8 h-8" />
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
                        {s.aula.disciplina.nome} · {s.aula.turma.codigo}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {s.aula.diaSemana} {s.aula.horarioInicio}-
                        {s.aula.horarioFim}
                      </p>
                    </div>
                    <Badge className={`${badge.className} border-transparent`}>
                      {badge.label}
                    </Badge>
                  </div>

                  <div className="text-sm text-foreground mb-2">
                    <span className="text-muted-foreground">De:</span>{" "}
                    {s.ambienteAtual.nome}
                    {s.ambienteSugerido && (
                      <>
                        {" "}
                        <span className="text-muted-foreground">
                          → Sugestão:
                        </span>{" "}
                        {s.ambienteSugerido.nome}
                      </>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    &ldquo;{s.justificativa}&rdquo; — {s.solicitante.firstName}{" "}
                    {s.solicitante.lastName}
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
