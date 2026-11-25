"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import ClipboardList from "lucide-react/dist/esm/icons/clipboard-list";
import Wrench from "lucide-react/dist/esm/icons/wrench";
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
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground font-public-sans tracking-tight">
          Itens patrimoniais
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Reporte defeitos em ativos fixos das salas e laboratórios
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
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

      <DataTable
        data={filteredItens}
        isLoading={isLoading}
        getRowKey={(item) => item.id}
        searchValue={(item) =>
          `${item.nome} ${item.ambiente.nome} ${item.numeroPatrimonio ?? ""}`
        }
        searchPlaceholder="Buscar por item, ambiente ou nº de patrimônio..."
        enableColumnToggle
        emptyState={{
          icon: <ClipboardList className="w-8 h-8" />,
          title: "Nenhum item encontrado",
          description:
            filtro === "Todos"
              ? "Não há itens patrimoniais cadastrados."
              : "Nenhum item neste estado.",
        }}
        columns={[
          {
            header: "Item",
            sortValue: (item) => item.nome,
            hideable: false,
            cell: (item) => (
              <div>
                <p className="font-medium">{item.nome}</p>
                {item.descricaoDefeito && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-destructive">
                    <AlertTriangle className="w-3 h-3" />
                    {item.descricaoDefeito}
                  </p>
                )}
              </div>
            ),
          },
          {
            header: "Ambiente",
            sortValue: (item) => item.ambiente.nome,
            cell: (item) => item.ambiente.nome,
          },
          {
            header: "Nº patrimônio",
            sortValue: (item) => item.numeroPatrimonio,
            cell: (item) => (
              <span className="font-mono text-sm">
                {item.numeroPatrimonio ?? "—"}
              </span>
            ),
          },
          {
            header: "Estado",
            sortValue: (item) => item.estado,
            cell: (item) => {
              const badge = estadoBadge[item.estado];
              return (
                <Badge className={`${badge.className} border-transparent`}>
                  {badge.label}
                </Badge>
              );
            },
          },
          {
            header: "Ações",
            hideable: false,
            cell: (item) => {
              if (item.estado === "funcionando") {
                return (
                  <Popover
                    open={reportingId === item.id}
                    onOpenChange={(open) => {
                      setReportingId(open ? item.id : null);
                      setDescricao("");
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Wrench className="w-3.5 h-3.5 mr-2" />
                        Reportar defeito
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-80 space-y-3">
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
                          size="sm"
                          onClick={() => {
                            setReportingId(null);
                            setDescricao("");
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
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
                    </PopoverContent>
                  </Popover>
                );
              }
              if (item.estado === "com_defeito") {
                return (
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
                );
              }
              return (
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
              );
            },
          },
        ]}
      />
    </div>
  );
}
