"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import CalendarClock from "lucide-react/dist/esm/icons/calendar-clock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
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

      <DataTable
        data={minhasReservas}
        isLoading={isLoading}
        getRowKey={(r) => r.id}
        searchValue={(r) => `${r.titulo} ${r.ambiente.nome}`}
        searchPlaceholder="Buscar por título ou ambiente..."
        emptyState={{
          icon: <CalendarClock className="w-8 h-8" />,
          title: "Nenhuma reserva solicitada",
          description: "Você ainda não solicitou nenhuma reserva de sala.",
          action: (
            <Link href="/professor/reservas/nova">
              <Button>Nova reserva</Button>
            </Link>
          ),
        }}
        columns={[
          {
            header: "Título",
            sortValue: (r) => r.titulo,
            cell: (r) => <span className="font-medium">{r.titulo}</span>,
          },
          {
            header: "Ambiente",
            sortValue: (r) => r.ambiente.nome,
            cell: (r) => r.ambiente.nome,
          },
          {
            header: "Data",
            sortValue: (r) => r.data,
            cell: (r) => <span className="font-mono text-sm">{r.data}</span>,
          },
          {
            header: "Horário",
            sortValue: (r) => r.horarioInicio,
            cell: (r) => (
              <span className="font-mono text-sm">
                {r.horarioInicio} - {r.horarioFim}
              </span>
            ),
          },
          {
            header: "Status",
            sortValue: (r) => r.status,
            cell: (r) =>
              r.status === "cancelada" ? (
                <Badge className="bg-destructive-bg text-destructive border-transparent">
                  Cancelada
                </Badge>
              ) : (
                <Badge className="bg-success-bg text-success border-transparent">
                  Confirmada
                </Badge>
              ),
          },
        ]}
      />
    </div>
  );
}
