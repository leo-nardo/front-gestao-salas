"use client";

import { useQuery } from "@tanstack/react-query";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Package from "lucide-react/dist/esm/icons/package";
import { Badge } from "@/components/ui/badge";
import { useGetEquipamentosService } from "@/services/api/services/equipamentos";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const getEquipamentos = useGetEquipamentosService();
  const { data: res, isLoading } = useQuery({
    queryKey: ["equipamentos"],
    queryFn: () => getEquipamentos(),
  });
  const equipamentos = res?.status === HTTP_CODES_ENUM.OK ? res.data.data : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1c1f21] font-public-sans tracking-tight">
          Equipamentos
        </h1>
        <p className="text-sm text-[#6f767b] mt-1">
          Acervo de equipamentos audiovisuais e sua disponibilidade
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
        </div>
      ) : equipamentos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipamentos.map((eq) => (
            <div
              key={eq.id}
              className="bg-white rounded-xl border border-[#e6e5e0] p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-[#e7edf8] p-2 rounded-lg text-[#3a4a99]">
                    <Package className="w-5 h-5" />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[#6f767b] border-[#dddbd3]"
                  >
                    {eq.tipo}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-[#1c1f21] mb-1">
                  {eq.nome}
                </h3>
                <p className="text-sm text-[#6f767b] mb-4">
                  {eq.unidade?.nome}
                </p>
                {eq.descricao && (
                  <p className="text-xs text-[#8a9095] mb-4 line-clamp-2">
                    {eq.descricao}
                  </p>
                )}
              </div>
              <div className="pt-4 border-t border-[#f0efea] flex items-center justify-between">
                <span className="text-sm text-[#6f767b]">Disponibilidade</span>
                <span className="font-ibm-plex-mono text-sm font-semibold text-[#1c1f21]">
                  {eq.quantidadeDisponivel} de {eq.quantidadeTotal} disponíveis
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-[#dddbd3] rounded-xl p-12 flex flex-col items-center justify-center text-center bg-white/50">
          <div className="w-16 h-16 rounded-full bg-[#f0efea] flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-[#6f767b]" />
          </div>
          <h3 className="text-xl font-semibold text-[#1c1f21] mb-2">
            Nenhum equipamento cadastrado
          </h3>
          <p className="text-sm text-[#6f767b]">
            Não há equipamentos cadastrados no sistema no momento.
          </p>
        </div>
      )}
    </div>
  );
}
