"use client";

import { PageContainer } from "@/components/layout/page-container";
import { useQuery } from "@tanstack/react-query";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";
import { DataTable } from "@/components/data-table";
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
    <PageContainer padded={false} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground font-public-sans tracking-tight">
          Eventos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Eventos abertos a todos os alunos
        </p>
      </div>

      <DataTable
        data={eventos}
        isLoading={isLoading}
        getRowKey={(e) => e.id}
        searchValue={(e) =>
          `${e.titulo} ${e.ambiente.nome} ${e.descricao ?? ""}`
        }
        searchPlaceholder="Buscar por evento ou local..."
        enableColumnToggle
        emptyState={{
          icon: <CalendarDays className="w-8 h-8" />,
          title: "Nenhum evento aberto",
          description: "Nenhum evento aberto no momento.",
        }}
        columns={[
          {
            header: "Evento",
            sortValue: (e) => e.titulo,
            hideable: false,
            cell: (e) => (
              <div>
                <p className="font-medium">{e.titulo}</p>
                {e.descricao && (
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {e.descricao}
                  </p>
                )}
              </div>
            ),
          },
          {
            header: "Data",
            sortValue: (e) => e.data,
            cell: (e) => <span className="font-mono text-sm">{e.data}</span>,
          },
          {
            header: "Horário",
            sortValue: (e) => e.horarioInicio,
            cell: (e) => (
              <span className="font-mono text-sm">
                {e.horarioInicio} - {e.horarioFim}
              </span>
            ),
          },
          {
            header: "Local",
            sortValue: (e) => e.ambiente.nome,
            cell: (e) => e.ambiente.nome,
          },
        ]}
      />
    </PageContainer>
  );
}
