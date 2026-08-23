"use client";

import { useQuery } from "@tanstack/react-query";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import { Card } from "@/components/ui/card";
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
        <h1 className="text-3xl font-bold text-foreground font-public-sans tracking-tight">
          Ambientes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Salas e laboratórios da instituição para a rotina de limpeza
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ambientes.map((a) => (
            <Card key={a.id} className="p-4 flex-row items-center gap-3">
              <div className="bg-accent p-2 rounded-lg text-accent-foreground shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{a.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {a.unidade?.nome} · {a.capacidade} lugares
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
