"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Wrench from "lucide-react/dist/esm/icons/wrench";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  useGetItemPatrimonialsService,
  useReportarDefeitoService,
  useUpdateItemPatrimonialService,
} from "@/services/api/services/item-patrimonials";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const estadoBadge: Record<string, { label: string; className: string }> = {
  funcionando: {
    label: "Funcionando",
    className: "bg-success-bg text-success",
  },
  com_defeito: {
    label: "Com defeito",
    className: "bg-destructive-bg text-destructive",
  },
  em_manutencao: {
    label: "Em manutenção",
    className: "bg-warning-bg text-warning",
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
    queryKey: ["item-patrimoniais", { limit: 500 }],
    queryFn: () => getItens({ limit: 500 }),
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
        <h1 className="text-3xl font-bold text-foreground font-public-sans tracking-tight">
          Itens patrimoniais
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
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
          >
            {f}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredItens.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Nenhum item encontrado.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItens.map((item) => {
            const badge = estadoBadge[item.estado];
            return (
              <Card key={item.id} className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground">{item.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.ambiente.nome}
                      {item.numeroPatrimonio && ` · ${item.numeroPatrimonio}`}
                    </p>
                  </div>
                  <Badge className={`${badge.className} border-transparent`}>
                    {badge.label}
                  </Badge>
                </div>

                {item.descricaoDefeito && (
                  <p className="text-sm text-destructive flex items-center gap-1 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {item.descricaoDefeito}
                  </p>
                )}

                {reportingId === item.id ? (
                  <div className="space-y-2 pt-2 border-t">
                    <Textarea
                      autoFocus
                      placeholder="Descreva o defeito encontrado"
                      className="text-sm"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setReportingId(null);
                          setDescricao("");
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
