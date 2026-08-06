"use client";

import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Aula } from "@/services/api/services/aulas";
import { WeekScheduleGrid } from "@/components/week-schedule-grid";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";

// MOCK DATA for Aluno Grade
const MOCK_GRADE: Aula[] = [
  {
    id: "1",
    disciplina: {
      id: "1",
      nome: "Direito Constitucional I",
      codigo: "DIR101",
      curso: { id: "1", nome: "Direito" },
    },
    professor: { id: "1", firstName: "Fábio B.", lastName: "Chaves" },
    turma: { id: "1", codigo: "308N1A" },
    ambiente: { id: "1", nome: "Anfiteatro", bloco: "C", andar: "Térreo" },
    diaSemana: 1, // Monday
    horarioInicio: "19:00",
    horarioFim: "20:40",
    status: "confirmada",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "2",
    disciplina: {
      id: "2",
      nome: "Direito Penal I",
      codigo: "DIR201",
      curso: { id: "1", nome: "Direito" },
    },
    professor: { id: "2", firstName: "Ana", lastName: "Ribeiro" },
    turma: { id: "1", codigo: "308N1A" },
    ambiente: { id: "2", nome: "Sala 308", bloco: "III", andar: "3º andar" },
    diaSemana: 1,
    horarioInicio: "20:40",
    horarioFim: "22:00",
    status: "confirmada",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "3",
    disciplina: {
      id: "3",
      nome: "Teoria Geral da Administração",
      codigo: "ADM101",
      curso: { id: "2", nome: "Administração" },
    },
    professor: { id: "3", firstName: "Carlos", lastName: "Mendes" },
    turma: { id: "2", codigo: "201N2A" },
    ambiente: { id: "3", nome: "Sala 201", bloco: "II", andar: "2º andar" },
    diaSemana: 2, // Tuesday
    horarioInicio: "19:00",
    horarioFim: "20:40",
    status: "confirmada",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "4",
    disciplina: {
      id: "4",
      nome: "Gestão de Custos",
      codigo: "ADM301",
      curso: { id: "2", nome: "Administração" },
    },
    professor: { id: "4", firstName: "Patrícia", lastName: "Lima" },
    turma: { id: "2", codigo: "201N2A" },
    ambiente: { id: "4", nome: "Sala 205", bloco: "II", andar: "2º andar" },
    diaSemana: 2,
    horarioInicio: "20:40",
    horarioFim: "22:00",
    status: "confirmada",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "5",
    disciplina: {
      id: "5",
      nome: "Genética e Biologia Molecular",
      codigo: "BIO201",
      curso: { id: "4", nome: "Biomedicina" },
    },
    professor: { id: "5", firstName: "Roberto", lastName: "Andrade" },
    turma: { id: "3", codigo: "410N3A" },
    ambiente: {
      id: "5",
      nome: "Lab. Biologia",
      bloco: "IV",
      andar: "1º andar",
    },
    diaSemana: 3, // Wednesday
    horarioInicio: "19:00",
    horarioFim: "20:40",
    status: "confirmada",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "6",
    disciplina: {
      id: "6",
      nome: "Estrutura de Dados",
      codigo: "ENG201",
      curso: { id: "5", nome: "Eng. de Software" },
    },
    professor: { id: "6", firstName: "Marcos", lastName: "Silva" },
    turma: { id: "4", codigo: "502N4A" },
    ambiente: {
      id: "6",
      nome: "Lab. Informática 1",
      bloco: "V",
      andar: "2º andar",
    },
    diaSemana: 4, // Thursday
    horarioInicio: "19:00",
    horarioFim: "21:30",
    status: "confirmada",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "7",
    disciplina: {
      id: "1",
      nome: "Direito Constitucional I",
      codigo: "DIR101",
      curso: { id: "1", nome: "Direito" },
    },
    professor: { id: "1", firstName: "Fábio B.", lastName: "Chaves" },
    turma: { id: "1", codigo: "308N1A" },
    ambiente: { id: "1", nome: "Anfiteatro", bloco: "C", andar: "Térreo" },
    diaSemana: 5, // Friday
    horarioInicio: "19:00",
    horarioFim: "20:40",
    status: "confirmada",
    createdAt: "",
    updatedAt: "",
  },
];

export default function GradePageContent() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday...

  // For the sake of the demo, let's force the view as if it's Monday
  const currentDayOfWeek = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : dayOfWeek;

  const formattedDate = format(today, "EEEE '·' dd MMM", { locale: ptBR });
  const capitalizedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  // Get today's classes
  const todaysClasses = MOCK_GRADE.filter(
    (aula) => aula.diaSemana === currentDayOfWeek
  ).sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));

  const currentClass = todaysClasses[0];
  const nextClasses = todaysClasses.slice(1);

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

                {/* Simulated alert banner for room change */}
                {currentClass.id === "1" && (
                  <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-[#f6eede] text-[#b26a12] border border-[#e8dcc8]">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold">Alteração de sala</p>
                      <p className="text-xs mt-0.5">
                        A aula foi movida da Sala 101 para o Anfiteatro.
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-[#e7edf8] rounded-xl p-4 flex items-start gap-3 border border-[#cad6e8]">
                  <div className="bg-white p-2 rounded-lg text-[#3a4a99] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a4f8a]">
                      {currentClass.ambiente.nome}
                    </p>
                    <p className="text-sm text-[#3a4a99]">
                      Bloco {currentClass.ambiente.bloco} ·{" "}
                      {currentClass.ambiente.andar}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-[#e6e5e0] shadow-sm text-center py-10">
                <p className="text-[#6f767b]">Nenhuma aula ocorrendo agora.</p>
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
                        {aula.ambiente.nome} · {aula.ambiente.bloco}
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
          <WeekScheduleGrid aulas={MOCK_GRADE} />
        </div>
      </div>
    </div>
  );
}
