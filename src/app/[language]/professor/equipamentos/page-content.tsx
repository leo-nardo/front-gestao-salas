"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import Package from "lucide-react/dist/esm/icons/package";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetMinhasSolicitacaoEquipamentosService } from "@/services/api/services/solicitacao-equipamentos";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const statusBadge: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-[#f6eede] text-[#b26a12]" },
  aprovada: { label: "Aprovada", className: "bg-[#e6f2ea] text-[#2f7d4f]" },
  rejeitada: { label: "Rejeitada", className: "bg-[#f7e7e2] text-[#a8442f]" },
  devolvida: { label: "Devolvida", className: "bg-[#f0efea] text-[#6f767b]" },
};

export default function PageContent() {
  const getMinhas = useGetMinhasSolicitacaoEquipamentosService();
  const { data: res, isLoading } = useQuery({
    queryKey: ["minhas-solicitacoes-equipamento"],
    queryFn: () => getMinhas(),
  });
  const solicitacoes = res?.status === HTTP_CODES_ENUM.OK ? res.data : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1c1f21] font-public-sans tracking-tight">
          Minhas solicitações de equipamento
        </h1>
        <Link href="/professor/equipamentos/nova">
          <Button className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Solicitar equipamento
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
        </div>
      ) : solicitacoes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-[#e6e5e0] shadow-sm text-center">
          <Package className="w-8 h-8 text-[#6f767b] mx-auto mb-4" />
          <p className="text-[#6f767b]">
            Você ainda não solicitou nenhum equipamento.
          </p>
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
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-[#1c1f21]">
                      {s.equipamento.nome} ({s.quantidade}{" "}
                      {s.quantidade === 1 ? "unidade" : "unidades"})
                    </p>
                    <p className="text-sm text-[#6f767b]">
                      De {s.dataInicio} até {s.dataFim}
                    </p>
                  </div>
                  <Badge className={`${badge.className} border-transparent`}>
                    {badge.label}
                  </Badge>
                </div>
                <p className="text-sm text-[#6f767b] mb-1">
                  &ldquo;{s.finalidade}&rdquo;
                </p>
                {s.motivoResposta && (
                  <p className="text-sm text-[#6f767b] pt-2 mt-2 border-t border-[#f0efea]">
                    Resposta: {s.motivoResposta}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
