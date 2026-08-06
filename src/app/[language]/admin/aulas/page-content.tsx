"use client";

import React, { useState, useMemo } from "react";
import Link from "@/components/link";
import Search from "lucide-react/dist/esm/icons/search";
import Plus from "lucide-react/dist/esm/icons/plus";
import { useGetAulasService, Aula } from "@/services/api/services/aulas";
import { useGetCursosService } from "@/services/api/services/cursos";
import { useQuery } from "@tanstack/react-query";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const courseColors: Record<
  string,
  { text: string; bg: string; border: string }
> = {
  Direito: { text: "#3a4a99", bg: "#eceef8", border: "#3a4a99" },
  Administração: { text: "#8a5a1a", bg: "#f6eede", border: "#8a5a1a" },
  Enfermagem: { text: "#0e6b62", bg: "#e2f0ee", border: "#0e6b62" },
  Biomedicina: { text: "#a8442f", bg: "#f7e7e2", border: "#a8442f" },
  "Eng. de Software": { text: "#5b53a6", bg: "#ecebf7", border: "#5b53a6" },
};

const diasSemana = [
  "",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];

export default function AulasPageContent() {
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredAulas = useMemo(() => {
    return aulas.filter((aula) => {
      const matchSearch =
        aula.disciplina.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aula.turma.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${aula.professor.firstName} ${aula.professor.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchCurso =
        cursoFilter === "all" || aula.disciplina.curso.id === cursoFilter;

      return matchSearch && matchCurso;
    });
  }, [aulas, searchTerm, cursoFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-[#1c1f21] font-public-sans">
          Aulas
        </h1>
        <Link href="/admin/aulas/nova">
          <Button className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nova aula
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-[#e6e5e0]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a9095]" />
          <Input
            placeholder="Buscar disciplina, turma, professor…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-[#dddbd3] bg-[#fbfaf7] focus-visible:ring-[#1a4f8a]"
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={cursoFilter} onValueChange={setCursoFilter}>
            <SelectTrigger className="border-[#dddbd3] bg-[#fbfaf7]">
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
      </div>

      <div className="text-sm text-[#6f767b]">
        {filteredAulas.length}{" "}
        {filteredAulas.length === 1 ? "aula montada" : "aulas montadas"}
      </div>

      <div className="bg-white rounded-xl border border-[#e6e5e0] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#faf9f5]">
            <TableRow className="border-b-[#f0efea]">
              <TableHead className="font-semibold text-[#1c1f21]">
                Disciplina
              </TableHead>
              <TableHead className="font-semibold text-[#1c1f21]">
                Turma
              </TableHead>
              <TableHead className="font-semibold text-[#1c1f21]">
                Professor
              </TableHead>
              <TableHead className="font-semibold text-[#1c1f21]">
                Dia · Horário
              </TableHead>
              <TableHead className="font-semibold text-[#1c1f21]">
                Ambiente
              </TableHead>
              <TableHead className="font-semibold text-[#1c1f21]">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-[#6f767b]"
                >
                  Carregando aulas...
                </TableCell>
              </TableRow>
            ) : filteredAulas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-[#6f767b]"
                >
                  Nenhuma aula encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredAulas.map((aula) => {
                const colorConfig = courseColors[
                  aula.disciplina.curso.nome
                ] || { border: "#dddbd3" };
                return (
                  <TableRow key={aula.id} className="border-b-[#f0efea]">
                    <TableCell className="relative pl-6">
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1.5"
                        style={{ backgroundColor: colorConfig.border }}
                      />
                      <div className="font-medium text-[#1c1f21]">
                        {aula.disciplina.nome}
                      </div>
                      <div className="text-xs text-[#6f767b]">
                        {aula.disciplina.curso.nome}
                      </div>
                    </TableCell>
                    <TableCell className="font-ibm-plex-mono text-sm">
                      {aula.turma.codigo}
                    </TableCell>
                    <TableCell>
                      {aula.professor.firstName} {aula.professor.lastName}
                    </TableCell>
                    <TableCell>
                      <div>{diasSemana[aula.diaSemana]}</div>
                      <div className="font-ibm-plex-mono text-sm text-[#6f767b]">
                        {aula.horarioInicio} - {aula.horarioFim}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{aula.ambiente.nome}</div>
                      <div className="text-xs text-[#6f767b]">
                        {aula.ambiente.bloco} • {aula.ambiente.andar}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={aula.status} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
