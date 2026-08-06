"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw";
import CalendarX from "lucide-react/dist/esm/icons/calendar-x";
import { AdminHeader } from "@/components/admin-header";
import { WeekScheduleGrid } from "@/components/week-schedule-grid";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAulasService, Aula } from "@/services/api/services/aulas";
import {
  useGetAmbientesService,
  Ambiente,
} from "@/services/api/services/ambientes";
import {
  useGetUnidadesService,
  Unidade,
} from "@/services/api/services/unidades";
import { useGetCursosService, Curso } from "@/services/api/services/cursos";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function EnsalamentoPageContent() {
  const [unidadeFilter, setUnidadeFilter] = useState<string>("all");
  const [ambienteFilter, setAmbienteFilter] = useState<string>("all");
  const [cursoFilter, setCursoFilter] = useState<string>("all");

  const getAulas = useGetAulasService();
  const { data: aulasRes, isLoading: isLoadingAulas } = useQuery({
    queryKey: ["aulas", { limit: 500 }],
    queryFn: () => getAulas({ limit: 500 }),
  });
  const aulas: Aula[] = useMemo(
    () => (aulasRes?.status === HTTP_CODES_ENUM.OK ? aulasRes.data.data : []),
    [aulasRes]
  );

  const getAmbientes = useGetAmbientesService();
  const { data: ambientesRes, isLoading: isLoadingAmbientes } = useQuery({
    queryKey: ["ambientes", { limit: "500" }],
    queryFn: () => getAmbientes({ limit: "500" }),
  });
  const ambientes: Ambiente[] = useMemo(
    () =>
      ambientesRes?.status === HTTP_CODES_ENUM.OK ? ambientesRes.data.data : [],
    [ambientesRes]
  );

  const getUnidades = useGetUnidadesService();
  const { data: unidadesRes, isLoading: isLoadingUnidades } = useQuery({
    queryKey: ["unidades"],
    queryFn: () => getUnidades(),
  });
  const unidades: Unidade[] = useMemo(
    () =>
      unidadesRes?.status === HTTP_CODES_ENUM.OK ? unidadesRes.data.data : [],
    [unidadesRes]
  );

  const getCursos = useGetCursosService();
  const { data: cursosRes, isLoading: isLoadingCursos } = useQuery({
    queryKey: ["cursos"],
    queryFn: () => getCursos(),
  });
  const cursos: Curso[] = useMemo(
    () => (cursosRes?.status === HTTP_CODES_ENUM.OK ? cursosRes.data : []),
    [cursosRes]
  );

  // Map ambienteId -> unidadeId
  const ambienteToUnidadeMap = useMemo(() => {
    const map = new Map<string, string>();
    ambientes.forEach((amb) => {
      if (amb.unidade?.id) {
        map.set(amb.id, amb.unidade.id);
      }
    });
    return map;
  }, [ambientes]);

  // Options for ambientes select filtered by selected unidade
  const ambienteOptions = useMemo(() => {
    if (unidadeFilter === "all") return ambientes;
    return ambientes.filter((amb) => amb.unidade?.id === unidadeFilter);
  }, [ambientes, unidadeFilter]);

  const handleUnidadeChange = (value: string) => {
    setUnidadeFilter(value);
    // If the currently selected ambiente doesn't belong to the newly selected unidade, reset it
    if (value !== "all" && ambienteFilter !== "all") {
      const selectedAmb = ambientes.find((a) => a.id === ambienteFilter);
      if (selectedAmb?.unidade?.id !== value) {
        setAmbienteFilter("all");
      }
    }
  };

  const isFiltered =
    unidadeFilter !== "all" ||
    ambienteFilter !== "all" ||
    cursoFilter !== "all";

  const handleClearFilters = () => {
    setUnidadeFilter("all");
    setAmbienteFilter("all");
    setCursoFilter("all");
  };

  const filteredAulas = useMemo(() => {
    return aulas.filter((aula) => {
      if (unidadeFilter !== "all") {
        const aulaUnidadeId = ambienteToUnidadeMap.get(aula.ambiente.id);
        if (aulaUnidadeId !== unidadeFilter) {
          return false;
        }
      }

      if (ambienteFilter !== "all") {
        if (aula.ambiente.id !== ambienteFilter) {
          return false;
        }
      }

      if (cursoFilter !== "all") {
        if (aula.disciplina.curso.id !== cursoFilter) {
          return false;
        }
      }

      return true;
    });
  }, [aulas, unidadeFilter, ambienteFilter, cursoFilter, ambienteToUnidadeMap]);

  const isLoading =
    isLoadingAulas ||
    isLoadingAmbientes ||
    isLoadingUnidades ||
    isLoadingCursos;

  return (
    <>
      <AdminHeader
        title="Ensalamento"
        subtitle="Visão geral da grade semanal de alocação de salas e turmas"
      />

      <div className="p-6 max-w-[1200px] mx-auto w-full space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-white p-4 rounded-xl border border-[#e6e5e0] shadow-sm">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Unidade / Campus */}
            <div>
              <Select value={unidadeFilter} onValueChange={handleUnidadeChange}>
                <SelectTrigger className="border-[#dddbd3] bg-[#fbfaf7]">
                  <SelectValue placeholder="Todas as unidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as unidades</SelectItem>
                  {unidades.map((unidade) => (
                    <SelectItem key={unidade.id} value={unidade.id}>
                      {unidade.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ambiente / Sala */}
            <div>
              <Select value={ambienteFilter} onValueChange={setAmbienteFilter}>
                <SelectTrigger className="border-[#dddbd3] bg-[#fbfaf7]">
                  <SelectValue placeholder="Todos os ambientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os ambientes</SelectItem>
                  {ambienteOptions.map((ambiente) => (
                    <SelectItem key={ambiente.id} value={ambiente.id}>
                      {ambiente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Curso */}
            <div>
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

          {/* Clear Filters Button */}
          {isFiltered && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="border-[#dddbd3] text-[#6f767b] hover:text-[#1c1f21] shrink-0"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpar filtros
            </Button>
          )}
        </div>

        {/* Count & Info */}
        <div className="flex items-center justify-between text-sm text-[#6f767b]">
          <span className="font-medium text-[#1c1f21]">
            {filteredAulas.length}{" "}
            {filteredAulas.length === 1
              ? "aula nesta visão"
              : "aulas nesta visão"}
          </span>
        </div>

        {/* Content / Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-[#e6e5e0] shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
          </div>
        ) : filteredAulas.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e6e5e0] p-12 text-center shadow-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#f0efea] flex items-center justify-center text-[#6f767b] mb-4">
              <CalendarX className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-[#1c1f21]">
              Nenhuma aula encontrada
            </h3>
            <p className="text-sm text-[#6f767b] mt-1 max-w-md mx-auto">
              Não há aulas cadastradas para a combinação de filtros selecionada.
              Tente ajustar a unidade, ambiente ou curso.
            </p>
            {isFiltered && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="mt-4 border-[#dddbd3] text-[#1a4f8a]"
              >
                Limpar filtros
              </Button>
            )}
          </div>
        ) : (
          <WeekScheduleGrid aulas={filteredAulas} />
        )}
      </div>
    </>
  );
}
