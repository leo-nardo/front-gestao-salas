"use client";

import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import {
  useGetMinhaGradeService,
  DiaSemana,
} from "@/services/api/services/aulas";
import { WeekScheduleGrid } from "@/components/week-schedule-grid";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const diasSemana: DiaSemana[] = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export default function GradePageContent() {
  const getMinhaGrade = useGetMinhaGradeService();
  const { data: gradeRes, isLoading } = useQuery({
    queryKey: ["minha-grade"],
    queryFn: () => getMinhaGrade(),
  });
  const aulas = gradeRes?.status === HTTP_CODES_ENUM.OK ? gradeRes.data : [];

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda...

  const currentDiaSemana: DiaSemana | null =
    dayOfWeek >= 1 && dayOfWeek <= 6 ? diasSemana[dayOfWeek - 1] : null;

  const formattedDate = format(today, "EEEE '·' dd MMM", { locale: ptBR });
  const capitalizedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const todaysClasses = currentDiaSemana
    ? aulas
        .filter((aula) => aula.diaSemana === currentDiaSemana)
        .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio))
    : [];

  const currentClass = todaysClasses[0];
  const nextClasses = todaysClasses.slice(1);

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
        <p className="text-sm font-medium text-[#6f767b] mb-1">
          {capitalizedDate}
        </p>
        <h1 className="text-3xl font-bold text-[#1c1f21] font-public-sans tracking-tight">
          Minha grade
        </h1>
      </div>

      {aulas.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-[#e6e5e0] shadow-sm text-center">
          <p className="text-[#6f767b]">
            Você ainda não está matriculado em nenhuma turma com aulas
            cadastradas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Today's detailed classes */}
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[#8a9095] tracking-widest uppercase">
                Agora
              </h2>

              {currentClass ? (
                <div className="bg-white rounded-2xl p-6 border border-[#e6e5e0] shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1a4f8a]" />

                  <div className="font-ibm-plex-mono text-2xl font-bold text-[#1c1f21] mb-2">
                    {currentClass.horarioInicio} - {currentClass.horarioFim}
                  </div>

                  <h3 className="text-xl font-bold text-[#1c1f21] mb-1 leading-tight">
                    {currentClass.disciplina.nome}
                  </h3>

                  <p className="text-sm text-[#6f767b] mb-6">
                    {currentClass.professor.firstName}{" "}
                    {currentClass.professor.lastName} ·{" "}
                    {currentClass.turma.codigo}
                  </p>

                  <div className="bg-[#e7edf8] rounded-xl p-4 flex items-start gap-3 border border-[#cad6e8]">
                    <div className="bg-white p-2 rounded-lg text-[#3a4a99] shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1a4f8a]">
                        {currentClass.ambiente.nome}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 border border-[#e6e5e0] shadow-sm text-center py-10">
                  <p className="text-[#6f767b]">
                    Nenhuma aula ocorrendo agora.
                  </p>
                </div>
              )}
            </div>

            {nextClasses.length > 0 && (
              <div className="space-y-4 pt-4">
                <h2 className="text-sm font-bold text-[#8a9095] tracking-widest uppercase">
                  Depois hoje
                </h2>

                <div className="space-y-3">
                  {nextClasses.map((aula) => (
                    <div
                      key={aula.id}
                      className="bg-white rounded-xl p-4 border border-[#e6e5e0] shadow-sm flex items-center gap-4"
                    >
                      <div className="font-ibm-plex-mono text-sm font-bold text-[#1c1f21] w-16 text-center">
                        <div>{aula.horarioInicio}</div>
                        <div className="text-[#8a9095] text-xs font-normal">
                          {aula.horarioFim}
                        </div>
                      </div>

                      <div className="w-px h-10 bg-[#e6e5e0]" />

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1c1f21] truncate">
                          {aula.disciplina.nome}
                        </p>
                        <p className="text-xs text-[#6f767b] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {aula.ambiente.nome}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column: Weekly overview */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-[#8a9095] tracking-widest uppercase">
              Visão semanal
            </h2>
            <WeekScheduleGrid aulas={aulas} />
          </div>
        </div>
      )}
    </div>
  );
}
