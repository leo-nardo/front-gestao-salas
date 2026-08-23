"use client";

import { useState } from "react";
import Link from "@/components/link";
import Plus from "lucide-react/dist/esm/icons/plus";
import Edit from "lucide-react/dist/esm/icons/edit";
import CalendarClock from "lucide-react/dist/esm/icons/calendar-clock";
import { useQuery } from "@tanstack/react-query";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { useGetAulasService, Aula } from "@/services/api/services/aulas";
import { useGetCursosService } from "@/services/api/services/cursos";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { getCourseColor } from "@/lib/course-colors";

export default function AulasPageContent() {
  const [cursoFilter, setCursoFilter] = useState<string>("all");

  const getAulas = useGetAulasService();
  const { data: aulasRes, isLoading } = useQuery({
    queryKey: ["aulas"],
    queryFn: () => getAulas(),
  });
  const aulas: Aula[] =
    aulasRes?.status === HTTP_CODES_ENUM.OK ? aulasRes.data.data : [];

  const getCursos = useGetCursosService();
  const { data: cursosRes } = useQuery({
    queryKey: ["cursos"],
    queryFn: () => getCursos(),
  });
  const cursos = cursosRes?.status === HTTP_CODES_ENUM.OK ? cursosRes.data : [];

  const filteredAulas =
    cursoFilter === "all"
      ? aulas
      : aulas.filter((aula) => aula.disciplina.curso.id === cursoFilter);

  const columns: DataTableColumn<Aula>[] = [
    {
      header: "Disciplina",
      cell: (aula) => (
        <div className="relative pl-3">
          <div
            className="absolute left-0 top-0.5 bottom-0.5 w-1 rounded-full"
            style={{
              backgroundColor: getCourseColor(aula.disciplina.curso.nome)
                .border,
            }}
          />
          <div className="font-medium text-foreground">
            {aula.disciplina.nome}
          </div>
          <div className="text-xs text-muted-foreground">
            {aula.disciplina.curso.nome}
          </div>
        </div>
      ),
    },
    {
      header: "Turma",
      cell: (aula) => (
        <span className="font-ibm-plex-mono text-sm">{aula.turma.codigo}</span>
      ),
    },
    {
      header: "Professor",
      cell: (aula) => `${aula.professor.firstName} ${aula.professor.lastName}`,
    },
    {
      header: "Dia · Horário",
      cell: (aula) => (
        <div>
          <div>{aula.diaSemana}</div>
          <div className="font-ibm-plex-mono text-sm text-muted-foreground">
            {aula.horarioInicio} - {aula.horarioFim}
          </div>
        </div>
      ),
    },
    {
      header: "Ambiente",
      cell: (aula) => aula.ambiente.nome,
    },
    {
      header: "Ações",
      cell: (aula) => (
        <Link href={`/admin/aulas/${aula.id}/editar`}>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Edit className="w-3.5 h-3.5 mr-1" />
            Editar
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <>
      <AdminHeader
        title="Aulas"
        subtitle="Grade de aulas por curso, turma e professor"
      />

      <div className="p-6 max-w-[1100px] mx-auto w-full space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="w-full md:w-[280px]">
            <Select value={cursoFilter} onValueChange={setCursoFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos os cursos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cursos</SelectItem>
                {cursos.map((curso) => (
                  <SelectItem key={curso.id} value={curso.id}>
                    {curso.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link href="/admin/aulas/nova">
            <Button className="w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nova aula
            </Button>
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={filteredAulas}
          isLoading={isLoading}
          getRowKey={(aula) => aula.id}
          searchValue={(aula) =>
            `${aula.disciplina.nome} ${aula.turma.codigo} ${aula.professor.firstName} ${aula.professor.lastName}`
          }
          searchPlaceholder="Buscar disciplina, turma, professor…"
          emptyState={{
            icon: <CalendarClock className="w-8 h-8" />,
            title: "Nenhuma aula encontrada",
            action: (
              <Link href="/admin/aulas/nova">
                <Button>Montar primeira aula</Button>
              </Link>
            ),
          }}
        />
      </div>
    </>
  );
}
