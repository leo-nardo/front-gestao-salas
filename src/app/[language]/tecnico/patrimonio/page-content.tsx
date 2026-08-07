"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Wrench from "lucide-react/dist/esm/icons/wrench";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetItemPatrimonialsService,
  useReportarDefeitoService,
  useUpdateItemPatrimonialService,
} from "@/services/api/services/item-patrimonials";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const estadoBadge: Record<string, { label: string; className: string }> = {
  funcionando: {
    label: "Funcionando",
    className: "bg-[#e6f2ea] text-[#2f7d4f]",
  },
  com_defeito: {
    label: "Com defeito",
    className: "bg-[#f7e7e2] text-[#a8442f]",
  },
  em_manutencao: {
    label: "Em manutenção",
    className: "bg-[#f6eede] text-[#b26a12]",
  },
};

export default function PageContent() {
  const queryClient = useQueryClient();
  const getItens = useGetItemPatrimonialsService();
  const reportarDefeito = useReportarDefeitoService();
  const updateItem = useUpdateItemPatrimonialService();
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [descricao, setDescricao] = useState("");
  const [filtro, setFiltro] = useState("Todos");

  const { data: res, isLoading } = useQuery({
    queryKey: ["item-patrimoniais"],
    queryFn: () => getItens(),
  });
  const itens = res?.status === HTTP_CODES_ENUM.OK ? res.data.data : [];
  const filteredItens = itens.filter((item) =>
    filtro === "Todos" ? true : estadoBadge[item.estado].label === filtro
  );

  const mutation = useMutation({
    mutationFn: (vars: { id: string; descricaoDefeito: string }) =>
      reportarDefeito(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-patrimoniais"] });
      setReportingId(null);
      setDescricao("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: {
      id: string;
      estado: string;
      descricaoDefeito?: string | null;
    }) => updateItem(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-patrimoniais"] });
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1c1f21] font-public-sans tracking-tight">
          Itens patrimoniais
        </h1>
        <p className="text-sm text-[#6f767b] mt-1">
          Reporte defeitos em ativos fixos das salas e laboratórios
        </p>
      </div>

      <div className="flex gap-2">
        {["Todos", "Com defeito", "Em manutenção", "Funcionando"].map((f) => (
          <Button
            key={f}
            variant={filtro === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltro(f)}
            className={
              filtro === f
                ? "bg-[#1c1f21] text-white"
                : "border-[#dddbd3] text-[#1c1f21]"
            }
          >
            {f}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
        </div>
      ) : filteredItens.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-[#e6e5e0] shadow-sm text-center">
          <p className="text-[#6f767b]">Nenhum item encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItens.map((item) => {
            const badge = estadoBadge[item.estado];
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-[#e6e5e0] p-5 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-[#1c1f21]">{item.nome}</p>
                    <p className="text-sm text-[#6f767b]">
                      {item.ambiente.nome}
                      {item.numeroPatrimonio && ` · ${item.numeroPatrimonio}`}
                    </p>
                  </div>
                  <Badge className={`${badge.className} border-transparent`}>
                    {badge.label}
                  </Badge>
                </div>

                {item.descricaoDefeito && (
                  <p className="text-sm text-[#a8442f] flex items-center gap-1 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {item.descricaoDefeito}
                  </p>
                )}

                {reportingId === item.id ? (
                  <div className="space-y-2 pt-2 border-t border-[#f0efea]">
                    <Textarea
                      autoFocus
                      placeholder="Descreva o defeito encontrado"
                      className="bg-[#fbfaf7] border-[#dddbd3] text-sm"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        className="border-[#dddbd3]"
                        onClick={() => {
                          setReportingId(null);
                          setDescricao("");
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="bg-[#a8442f] hover:bg-[#8a3626] text-white"
                        disabled={!descricao || mutation.isPending}
                        onClick={() =>
                          mutation.mutate({
                            id: item.id,
                            descricaoDefeito: descricao,
                          })
                        }
                      >
                        Confirmar defeito
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-2">
                    {item.estado === "funcionando" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#dddbd3] text-[#1c1f21]"
                        onClick={() => setReportingId(item.id)}
                      >
                        <Wrench className="w-3.5 h-3.5 mr-2" />
                        Reportar defeito
                      </Button>
                    )}
                    {item.estado === "com_defeito" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#dddbd3] text-[#1c1f21]"
                        disabled={updateMutation.isPending}
                        onClick={() =>
                          updateMutation.mutate({
                            id: item.id,
                            estado: "em_manutencao",
                          })
                        }
                      >
                        <Wrench className="w-3.5 h-3.5 mr-2" />
                        Iniciar manutenção
                      </Button>
                    )}
                    {item.estado === "em_manutencao" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#dddbd3] text-[#1c1f21]"
                        disabled={updateMutation.isPending}
                        onClick={() =>
                          updateMutation.mutate({
                            id: item.id,
                            estado: "funcionando",
                            descricaoDefeito: null,
                          })
                        }
                      >
                        Marcar como reparado
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
