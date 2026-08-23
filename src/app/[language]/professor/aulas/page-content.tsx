"use client";

import { useQuery } from "@tanstack/react-query";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import { useGetAulasService } from "@/services/api/services/aulas";
import { WeekScheduleGrid } from "@/components/week-schedule-grid";
import { Card } from "@/components/ui/card";
import useAuth from "@/services/auth/use-auth";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const { user } = useAuth();
  const getAulas = useGetAulasService();
  const { data: res, isLoading } = useQuery({
    queryKey: ["aulas"],
    queryFn: () => getAulas(),
  });
  const allAulas = res?.status === HTTP_CODES_ENUM.OK ? res.data.data : [];
  const minhasAulas = allAulas.filter(
    (aula) => String(aula.professor.id) === String(user?.id)
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground font-public-sans tracking-tight">
          Minhas aulas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {minhasAulas.length} {minhasAulas.length === 1 ? "aula" : "aulas"}{" "}
          nesta grade
        </p>
      </div>

      {minhasAulas.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            Nenhuma aula atribuída a você ainda.
          </p>
        </Card>
      ) : (
        <>
          <WeekScheduleGrid aulas={minhasAulas} />

          <div className="space-y-3">
            {minhasAulas.map((aula) => (
              <Card key={aula.id} className="p-4 flex-row items-center gap-4">
                <div className="font-ibm-plex-mono text-sm font-bold text-foreground w-32">
                  <div>{aula.diaSemana}</div>
                  <div className="text-muted-foreground text-xs font-normal">
                    {aula.horarioInicio} - {aula.horarioFim}
                  </div>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {aula.disciplina.nome}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {aula.ambiente.nome} · Turma {aula.turma.codigo}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
