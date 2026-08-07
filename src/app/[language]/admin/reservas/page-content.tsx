"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import CalendarClock from "lucide-react/dist/esm/icons/calendar-clock";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetReservasService } from "@/services/api/services/reservas";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const getReservas = useGetReservasService();
  const { data: res, isLoading } = useQuery({
    queryKey: ["reservas", { limit: 500 }],
    queryFn: () => getReservas({ limit: 500 }),
  });
  const reservas = res?.status === HTTP_CODES_ENUM.OK ? res.data.data : [];

  return (
    <>
      <AdminHeader
        title="Reservas"
        subtitle="Reservas pontuais de ambientes e eventos abertos"
      />

      <div className="p-6 max-w-[1000px] mx-auto w-full">
        <div className="flex justify-end mb-6">
          <Link href="/admin/reservas/nova">
            <Button className="h-10 bg-[#1a4f8a] hover:bg-[#123c6e] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nova reserva
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
          </div>
        ) : reservas.length > 0 ? (
          <div className="space-y-3">
            {reservas.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-[#e6e5e0] p-4 shadow-sm flex items-center gap-4"
              >
                <div className="bg-[#e7edf8] p-2.5 rounded-lg text-[#3a4a99] shrink-0">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#1c1f21] truncate">
                      {r.titulo}
                    </p>
                    {r.eventoAberto && (
                      <Badge className="bg-[#e6f2ea] text-[#2f7d4f] hover:bg-[#e6f2ea]/80 border-transparent">
                        Evento aberto
                      </Badge>
                    )}
                    {r.status === "cancelada" && (
                      <Badge className="bg-[#f7e7e2] text-[#a8442f] hover:bg-[#f7e7e2]/80 border-transparent">
                        Cancelada
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-[#6f767b]">
                    {r.ambiente.nome} · {r.data} · {r.horarioInicio} -{" "}
                    {r.horarioFim}
                  </p>
                </div>
                <div className="text-sm text-[#6f767b] text-right shrink-0">
                  {r.solicitante.firstName} {r.solicitante.lastName}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-[#dddbd3] rounded-xl p-12 flex flex-col items-center justify-center text-center bg-white/50 mt-8">
            <div className="w-16 h-16 rounded-full bg-[#f0efea] flex items-center justify-center mb-4">
              <CalendarClock className="w-8 h-8 text-[#6f767b]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1c1f21] mb-2">
              Nenhuma reserva cadastrada
            </h3>
            <Link href="/admin/reservas/nova">
              <Button className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white">
                Cadastrar primeira reserva
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
