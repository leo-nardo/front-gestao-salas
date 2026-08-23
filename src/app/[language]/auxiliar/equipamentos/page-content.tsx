"use client";

import { useQuery } from "@tanstack/react-query";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Package from "lucide-react/dist/esm/icons/package";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useGetEquipamentosService } from "@/services/api/services/equipamentos";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const getEquipamentos = useGetEquipamentosService();
  const { data: res, isLoading } = useQuery({
    queryKey: ["equipamentos"],
    queryFn: () => getEquipamentos(),
  });
  const equipamentos = res?.status === HTTP_CODES_ENUM.OK ? res.data.data : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground font-public-sans tracking-tight">
          Equipamentos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acervo de equipamentos audiovisuais e sua disponibilidade
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : equipamentos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipamentos.map((eq) => (
            <Card key={eq.id} className="p-5 justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-accent p-2 rounded-lg text-accent-foreground">
                    <Package className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-muted-foreground">
                    {eq.tipo}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {eq.nome}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {eq.unidade?.nome}
                </p>
                {eq.descricao && (
                  <p className="text-xs text-muted-foreground/80 mb-4 line-clamp-2">
                    {eq.descricao}
                  </p>
                )}
              </div>
              <div className="pt-4 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Disponibilidade
                </span>
                <span className="font-ibm-plex-mono text-sm font-semibold text-foreground">
                  {eq.quantidadeDisponivel} de {eq.quantidadeTotal} disponíveis
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center bg-muted/30">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhum equipamento cadastrado
          </h3>
          <p className="text-sm text-muted-foreground">
            Não há equipamentos cadastrados no sistema no momento.
          </p>
        </div>
      )}
    </div>
  );
}
