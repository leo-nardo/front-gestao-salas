"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import CalendarClock from "lucide-react/dist/esm/icons/calendar-clock";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useGetReservasService } from "@/services/api/services/reservas";
import useAuth from "@/services/auth/use-auth";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const { user } = useAuth();
  const getReservas = useGetReservasService();
  const { data: res, isLoading } = useQuery({
    queryKey: ["reservas", { limit: 500 }],
    queryFn: () => getReservas({ limit: 500 }),
  });

  const allReservas = res?.status === HTTP_CODES_ENUM.OK ? res.data.data : [];
  const minhasReservas = allReservas.filter(
    (r) => String(r.solicitante?.id) === String(user?.id)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-public-sans tracking-tight">
            Minhas reservas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reservas sob demanda de salas e ambientes
          </p>
        </div>
        <Link href="/professor/reservas/nova">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova reserva
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : minhasReservas.length > 0 ? (
        <div className="space-y-3">
          {minhasReservas.map((r) => (
            <Card key={r.id} className="p-4 flex-row items-center gap-4">
              <div className="bg-accent p-2.5 rounded-lg text-accent-foreground shrink-0">
                <CalendarClock className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground truncate">
                    {r.titulo}
                  </p>
                  {r.status === "cancelada" ? (
                    <Badge className="bg-destructive-bg text-destructive border-transparent">
                      Cancelada
                    </Badge>
                  ) : (
                    <Badge className="bg-success-bg text-success border-transparent">
                      Confirmada
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {r.ambiente.nome} · {r.data} · {r.horarioInicio} -{" "}
                  {r.horarioFim}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center bg-muted/30">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
            <CalendarClock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhuma reserva solicitada
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Você ainda não solicitou nenhuma reserva de sala.
          </p>
          <Link href="/professor/reservas/nova">
            <Button>Nova reserva</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
