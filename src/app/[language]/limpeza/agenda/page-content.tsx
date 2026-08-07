"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import CalendarX from "lucide-react/dist/esm/icons/calendar-x";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";
import { WeekScheduleGrid } from "@/components/week-schedule-grid";
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
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

export default function PageContent() {
  const [ambienteFilter, setAmbienteFilter] = useState<string>("all");

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

  const filteredAulas = useMemo(() => {
    if (ambienteFilter === "all") return [];
    return aulas.filter((aula) => aula.ambiente.id === ambienteFilter);
  }, [aulas, ambienteFilter]);

  const isLoading = isLoadingAulas || isLoadingAmbientes;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1c1f21] font-public-sans tracking-tight">
          Agenda por Ambiente
        </h1>
        <p className="text-sm text-[#6f767b] mt-1">
          Verifique os horários das aulas para planejar a limpeza
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#e6e5e0] shadow-sm max-w-sm">
        <label className="block text-sm font-medium text-[#1c1f21] mb-2">
          Selecione o ambiente
        </label>
        <Select value={ambienteFilter} onValueChange={setAmbienteFilter}>
          <SelectTrigger className="border-[#dddbd3] bg-[#fbfaf7]">
            <SelectValue placeholder="Escolha um ambiente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Escolha um ambiente</SelectItem>
            {ambientes.map((ambiente) => (
              <SelectItem key={ambiente.id} value={ambiente.id}>
                {ambiente.nome}{" "}
                {ambiente.unidade ? `(${ambiente.unidade.nome})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-[#e6e5e0] shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
        </div>
      ) : ambienteFilter === "all" ? (
        <div className="bg-white rounded-xl border border-[#e6e5e0] p-12 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#f0efea] flex items-center justify-center text-[#6f767b] mb-4">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-[#1c1f21]">
            Nenhum ambiente selecionado
          </h3>
          <p className="text-sm text-[#6f767b] mt-1 max-w-md mx-auto">
            Selecione um ambiente acima para visualizar a grade semanal e
            identificar horários livres.
          </p>
        </div>
      ) : filteredAulas.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e6e5e0] p-12 text-center shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#f0efea] flex items-center justify-center text-[#6f767b] mb-4">
            <CalendarX className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-[#1c1f21]">
            Nenhuma aula programada
          </h3>
          <p className="text-sm text-[#6f767b] mt-1 max-w-md mx-auto">
            Este ambiente não possui aulas cadastradas na grade atual, portanto
            está livre.
          </p>
        </div>
      ) : (
        <WeekScheduleGrid aulas={filteredAulas} />
      )}
    </div>
  );
}
