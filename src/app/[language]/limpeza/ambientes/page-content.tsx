"use client";

import { PageContainer } from "@/components/layout/page-container";
import { useQuery } from "@tanstack/react-query";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import { DataTable } from "@/components/data-table";
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
    <PageContainer padded={false} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground font-public-sans tracking-tight">
          Ambientes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Salas e laboratórios da instituição para a rotina de limpeza
        </p>
      </div>

      <DataTable
        data={ambientes}
        isLoading={isLoading}
        getRowKey={(a) => a.id}
        searchValue={(a) => `${a.nome} ${a.unidade?.nome ?? ""}`}
        searchPlaceholder="Buscar por ambiente ou unidade..."
        emptyState={{
          icon: <MapPin className="w-8 h-8" />,
          title: "Nenhum ambiente",
          description: "Não há ambientes cadastrados.",
        }}
        columns={[
          {
            header: "Ambiente",
            sortValue: (a) => a.nome,
            cell: (a) => <span className="font-medium">{a.nome}</span>,
          },
          {
            header: "Unidade",
            sortValue: (a) => a.unidade?.nome,
            cell: (a) => a.unidade?.nome ?? "—",
          },
          {
            header: "Capacidade",
            sortValue: (a) => a.capacidade,
            cell: (a) => `${a.capacidade} lugares`,
          },
        ]}
      />
    </PageContainer>
  );
}
