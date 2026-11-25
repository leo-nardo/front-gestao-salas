"use client";

import { useQuery } from "@tanstack/react-query";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import GraduationCap from "lucide-react/dist/esm/icons/graduation-cap";
import { useGetAulasService } from "@/services/api/services/aulas";
import { WeekScheduleGrid } from "@/components/week-schedule-grid";
import { DataTable } from "@/components/data-table";
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

      {minhasAulas.length > 0 && <WeekScheduleGrid aulas={minhasAulas} />}

      <DataTable
        data={minhasAulas}
        getRowKey={(aula) => aula.id}
        searchValue={(aula) =>
          `${aula.disciplina.nome} ${aula.ambiente.nome} ${aula.turma.codigo}`
        }
        searchPlaceholder="Buscar por disciplina, ambiente ou turma..."
        emptyState={{
          icon: <GraduationCap className="w-8 h-8" />,
          title: "Nenhuma aula atribuída",
          description: "Nenhuma aula atribuída a você ainda.",
        }}
        columns={[
          {
            header: "Dia",
            sortValue: (aula) => aula.diaSemana,
            cell: (aula) => (
              <span className="font-ibm-plex-mono text-sm font-bold">
                {aula.diaSemana}
              </span>
            ),
          },
          {
            header: "Horário",
            sortValue: (aula) => aula.horarioInicio,
            cell: (aula) => (
              <span className="font-mono text-sm">
                {aula.horarioInicio} - {aula.horarioFim}
              </span>
            ),
          },
          {
            header: "Disciplina",
            sortValue: (aula) => aula.disciplina.nome,
            cell: (aula) => (
              <span className="font-medium">{aula.disciplina.nome}</span>
            ),
          },
          {
            header: "Ambiente",
            sortValue: (aula) => aula.ambiente.nome,
            cell: (aula) => aula.ambiente.nome,
          },
          {
            header: "Turma",
            sortValue: (aula) => aula.turma.codigo,
            cell: (aula) => aula.turma.codigo,
          },
        ]}
      />
    </div>
  );
}
