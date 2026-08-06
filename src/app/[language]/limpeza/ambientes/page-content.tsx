"use client";

import { useQuery } from "@tanstack/react-query";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import { useGetAmbientesService } from "@/services/api/services/ambientes";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const getAmbientes = useGetAmbientesService();
  const { data: res, isLoading } = useQuery({
    queryKey: ["ambientes"],
    queryFn: () => getAmbientes(),
  });
  const ambientes = res?.status === HTTP_CODES_ENUM.OK ? res.data.data : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1c1f21] font-public-sans tracking-tight">
          Ambientes
        </h1>
        <p className="text-sm text-[#6f767b] mt-1">
          Salas e laboratórios da instituição para a rotina de limpeza
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ambientes.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-[#e6e5e0] p-4 shadow-sm flex items-center gap-3"
            >
              <div className="bg-[#e7edf8] p-2 rounded-lg text-[#3a4a99] shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-[#1c1f21] truncate">{a.nome}</p>
                <p className="text-xs text-[#6f767b]">
                  {a.unidade?.nome} · {a.capacidade} lugares
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
