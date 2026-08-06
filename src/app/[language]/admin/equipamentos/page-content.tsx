"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import Package from "lucide-react/dist/esm/icons/package";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
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
    <>
      <AdminHeader
        title="Equipamentos"
        subtitle="Gerencie o acervo de equipamentos emprestáveis"
      />

      <div className="p-6 max-w-[1200px] mx-auto w-full">
        <div className="flex justify-end mb-6">
          <Link href="/admin/equipamentos/novo">
            <Button className="h-10 bg-[#1a4f8a] hover:bg-[#123c6e] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo equipamento
            </Button>
          </Link>
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
                className="bg-white rounded-xl border border-[#e6e5e0] p-5 shadow-sm"
              >
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
                <div className="flex items-center justify-between pt-4 border-t border-[#f0efea]">
                  <span className="text-sm text-[#6f767b]">Disponível</span>
                  <span className="font-ibm-plex-mono font-semibold text-[#1c1f21]">
                    {eq.quantidadeDisponivel} / {eq.quantidadeTotal}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-[#dddbd3] rounded-xl p-12 flex flex-col items-center justify-center text-center bg-white/50 mt-8">
            <div className="w-16 h-16 rounded-full bg-[#f0efea] flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-[#6f767b]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1c1f21] mb-2">
              Nenhum equipamento cadastrado
            </h3>
            <Link href="/admin/equipamentos/novo">
              <Button className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white">
                Cadastrar primeiro equipamento
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
