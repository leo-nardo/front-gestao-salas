"use client";

import { useQuery } from "@tanstack/react-query";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import { useGetEventosAbertosService } from "@/services/api/services/reservas";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const getEventosAbertos = useGetEventosAbertosService();
  const { data: res, isLoading } = useQuery({
    queryKey: ["eventos-abertos"],
    queryFn: () => getEventosAbertos(),
  });
  const eventos = res?.status === HTTP_CODES_ENUM.OK ? res.data : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1c1f21] font-public-sans tracking-tight">
          Eventos
        </h1>
        <p className="text-sm text-[#6f767b] mt-1">
          Eventos abertos a todos os alunos
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
        </div>
      ) : eventos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-[#e6e5e0] shadow-sm text-center">
          <CalendarDays className="w-8 h-8 text-[#6f767b] mx-auto mb-4" />
          <p className="text-[#6f767b]">Nenhum evento aberto no momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {eventos.map((e) => (
            <div
              key={e.id}
              className="bg-white rounded-xl border border-[#e6e5e0] p-5 shadow-sm"
            >
              <p className="font-semibold text-[#1c1f21] mb-1">{e.titulo}</p>
              {e.descricao && (
                <p className="text-sm text-[#6f767b] mb-3">{e.descricao}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-[#6f767b]">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {e.data} · {e.horarioInicio}-{e.horarioFim}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {e.ambiente.nome}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
