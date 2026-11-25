"use client";

import { routes } from "@/routes";
import { useQuery } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import CalendarClock from "lucide-react/dist/esm/icons/calendar-clock";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
          <Link href={routes.reservas.admin.create()}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova reserva
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : reservas.length > 0 ? (
          <div className="space-y-3">
            {reservas.map((r) => (
              <Card key={r.id} className="p-4 flex-row items-center gap-4">
                <div className="bg-accent p-2.5 rounded-lg text-accent-foreground shrink-0">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground truncate">
                      {r.titulo}
                    </p>
                    {r.eventoAberto && (
                      <Badge className="bg-success-bg text-success border-transparent">
                        Evento aberto
                      </Badge>
                    )}
                    {r.status === "cancelada" && (
                      <Badge className="bg-destructive-bg text-destructive border-transparent">
                        Cancelada
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {r.ambiente.nome} · {r.data} · {r.horarioInicio} -{" "}
                    {r.horarioFim}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground text-right shrink-0">
                  {r.solicitante.firstName} {r.solicitante.lastName}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center bg-muted/30 mt-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
              <CalendarClock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhuma reserva cadastrada
            </h3>
            <Link href={routes.reservas.admin.create()}>
              <Button>Cadastrar primeira reserva</Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
