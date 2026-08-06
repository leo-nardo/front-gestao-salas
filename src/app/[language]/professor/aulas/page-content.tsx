"use client";

import { useQuery } from "@tanstack/react-query";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import { useGetAulasService } from "@/services/api/services/aulas";
import { WeekScheduleGrid } from "@/components/week-schedule-grid";
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
        <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1c1f21] font-public-sans tracking-tight">
          Minhas aulas
        </h1>
        <p className="text-sm text-[#6f767b] mt-1">
          {minhasAulas.length} {minhasAulas.length === 1 ? "aula" : "aulas"}{" "}
          nesta grade
        </p>
      </div>

      {minhasAulas.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-[#e6e5e0] shadow-sm text-center">
          <p className="text-[#6f767b]">Nenhuma aula atribuída a você ainda.</p>
        </div>
      ) : (
        <>
          <WeekScheduleGrid aulas={minhasAulas} />

          <div className="space-y-3">
            {minhasAulas.map((aula) => (
              <div
                key={aula.id}
                className="bg-white rounded-xl p-4 border border-[#e6e5e0] shadow-sm flex items-center gap-4"
              >
                <div className="font-ibm-plex-mono text-sm font-bold text-[#1c1f21] w-32">
                  <div>{aula.diaSemana}</div>
                  <div className="text-[#8a9095] text-xs font-normal">
                    {aula.horarioInicio} - {aula.horarioFim}
                  </div>
                </div>
                <div className="w-px h-10 bg-[#e6e5e0]" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1c1f21] truncate">
                    {aula.disciplina.nome}
                  </p>
                  <p className="text-xs text-[#6f767b] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {aula.ambiente.nome} · Turma {aula.turma.codigo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
