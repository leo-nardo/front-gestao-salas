"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ArrowLeftRight from "lucide-react/dist/esm/icons/arrow-left-right";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetSolicitacaoTrocaSalasService,
  useResponderSolicitacaoService,
} from "@/services/api/services/solicitacao-troca-salas";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const statusBadge: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-[#f6eede] text-[#b26a12]" },
  aprovada: { label: "Aprovada", className: "bg-[#e6f2ea] text-[#2f7d4f]" },
  rejeitada: { label: "Rejeitada", className: "bg-[#f7e7e2] text-[#a8442f]" },
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
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
          </div>
        ) : solicitacoes.length === 0 ? (
          <div className="border-2 border-dashed border-[#dddbd3] rounded-xl p-12 flex flex-col items-center justify-center text-center bg-white/50">
            <div className="w-16 h-16 rounded-full bg-[#f0efea] flex items-center justify-center mb-4">
              <ArrowLeftRight className="w-8 h-8 text-[#6f767b]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1c1f21] mb-2">
              Nenhuma solicitação
            </h3>
          </div>
        ) : (
          <div className="space-y-4">
            {solicitacoes.map((s) => {
              const badge = statusBadge[s.status];
              return (
                <div
                  key={s.id}
                  className="bg-white rounded-xl border border-[#e6e5e0] p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-[#1c1f21]">
                        {s.aula.disciplina.nome} · {s.aula.turma.codigo}
                      </p>
                      <p className="text-sm text-[#6f767b]">
                        {s.aula.diaSemana} {s.aula.horarioInicio}-
                        {s.aula.horarioFim}
                      </p>
                    </div>
                    <Badge className={`${badge.className} border-transparent`}>
                      {badge.label}
                    </Badge>
                  </div>

                  <div className="text-sm text-[#1c1f21] mb-2">
                    <span className="text-[#6f767b]">De:</span>{" "}
                    {s.ambienteAtual.nome}
                    {s.ambienteSugerido && (
                      <>
                        {" "}
                        <span className="text-[#6f767b]">→ Sugestão:</span>{" "}
                        {s.ambienteSugerido.nome}
                      </>
                    )}
                  </div>

                  <p className="text-sm text-[#6f767b] mb-4">
                    &ldquo;{s.justificativa}&rdquo; — {s.solicitante.firstName}{" "}
                    {s.solicitante.lastName}
                  </p>

                  {s.status === "pendente" ? (
                    <div className="space-y-3 pt-3 border-t border-[#f0efea]">
                      <Textarea
                        placeholder="Comentário opcional (motivo da resposta)"
                        className="bg-[#fbfaf7] border-[#dddbd3] text-sm"
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
                          className="border-[#dddbd3] text-[#a8442f]"
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
                          className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white"
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
                      <p className="text-sm text-[#6f767b] pt-3 border-t border-[#f0efea]">
                        Resposta: {s.motivoResposta}
                      </p>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
