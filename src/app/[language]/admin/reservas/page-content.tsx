"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import CalendarClock from "lucide-react/dist/esm/icons/calendar-clock";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
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

      <div className="p-6 max-w-[1100px] mx-auto w-full space-y-6">
        <div className="flex justify-end">
          <Link href="/admin/reservas/nova">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova reserva
            </Button>
          </Link>
        </div>

        <DataTable
          data={reservas}
          isLoading={isLoading}
          getRowKey={(r) => r.id}
          searchValue={(r) =>
            `${r.titulo} ${r.ambiente.nome} ${r.solicitante.firstName} ${r.solicitante.lastName}`
          }
          searchPlaceholder="Buscar por título, ambiente ou solicitante..."
          enableColumnToggle
          emptyState={{
            icon: <CalendarClock className="w-8 h-8" />,
            title: "Nenhuma reserva cadastrada",
            description: "Cadastre a primeira reserva pra começar.",
            action: (
              <Link href="/admin/reservas/nova">
                <Button>Cadastrar primeira reserva</Button>
              </Link>
            ),
          }}
          columns={[
            {
              header: "Título",
              sortValue: (r) => r.titulo,
              hideable: false,
              cell: (r) => (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.titulo}</span>
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
              ),
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
              header: "Solicitante",
              sortValue: (r) =>
                `${r.solicitante.firstName} ${r.solicitante.lastName}`,
              cell: (r) => (
                <span className="text-muted-foreground">
                  {r.solicitante.firstName} {r.solicitante.lastName}
                </span>
              ),
            },
          ]}
        />
      </div>
    </>
  );
}
