"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Plus from "lucide-react/dist/esm/icons/plus";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetAulasService,
  Aula,
  DiaSemana,
} from "@/services/api/services/aulas";
import {
  useGetReservasService,
  Reserva,
} from "@/services/api/services/reservas";
import {
  useGetAmbientesService,
  Ambiente,
} from "@/services/api/services/ambientes";
import {
  useGetUnidadesService,
  Unidade,
} from "@/services/api/services/unidades";
import { useGetCursosService, Curso } from "@/services/api/services/cursos";
import { useGetUsersService } from "@/services/api/services/users";
import {
  useGetTipoAmbientesService,
  TipoAmbiente,
} from "@/services/api/services/tipo-ambientes";
import { RoleEnum } from "@/services/api/types/role";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

import { MapaView, GroupBy } from "@/components/ensalamento/mapa-view";
import { GradeView } from "@/components/ensalamento/grade-view";
import { BlockDetailSheet } from "@/components/ensalamento/block-detail-sheet";
import { NewBlockSheet } from "@/components/ensalamento/new-block-sheet";
import {
  SavedViewsBar,
  useSavedViews,
  SavedViewFilters,
} from "@/components/ensalamento/saved-views";
import {
  DIAS_SEMANA,
  DIA_ABREV,
  Turno,
  EnsalamentoBlock,
  aulaToBlock,
  reservaToBlock,
  currentWeekDates,
} from "@/components/ensalamento/types";

type ViewMode = "mapa" | "grade";

export default function EnsalamentoPageContent() {
  const [day, setDay] = useState<DiaSemana>("Segunda");
  const [viewMode, setViewMode] = useState<ViewMode>("mapa");

  const [unidadeFilter, setUnidadeFilter] = useState("all");
  const [cursoFilter, setCursoFilter] = useState("all");
  const [professorFilter, setProfessorFilter] = useState("all");

  const [groupBy, setGroupBy] = useState<GroupBy>("bloco");
  const [periodo, setPeriodo] = useState<"Todos" | Turno>("Todos");
  const [blocosSel, setBlocosSel] = useState<string[]>([]);
  const [andaresSel, setAndaresSel] = useState<string[]>([]);
  const [tipoFilter, setTipoFilter] = useState<string>("Todos");

  const [selectedBlock, setSelectedBlock] = useState<EnsalamentoBlock | null>(
    null
  );
  const [newSlot, setNewSlot] = useState<{
    ambienteId: string;
    horarioInicio: string;
  } | null>(null);

  const {
    views: savedViews,
    save: saveView,
    remove: removeView,
  } = useSavedViews();

  const getAulas = useGetAulasService();
  const { data: aulasRes, isLoading: isLoadingAulas } = useQuery({
    queryKey: ["aulas", { limit: 500 }],
    queryFn: () => getAulas({ limit: 500 }),
  });
  const aulas: Aula[] = useMemo(
    () => (aulasRes?.status === HTTP_CODES_ENUM.OK ? aulasRes.data.data : []),
    [aulasRes]
  );

  const getReservas = useGetReservasService();
  const { data: reservasRes, isLoading: isLoadingReservas } = useQuery({
    queryKey: ["reservas", { limit: 500 }],
    queryFn: () => getReservas({ limit: 500 }),
  });
  const reservas: Reserva[] = useMemo(
    () =>
      reservasRes?.status === HTTP_CODES_ENUM.OK ? reservasRes.data.data : [],
    [reservasRes]
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

  const getTipoAmbientes = useGetTipoAmbientesService();
  const { data: tipoAmbientesRes, isLoading: isLoadingTipos } = useQuery({
    queryKey: ["tipo-ambientes", { limit: "500" }],
    queryFn: () => getTipoAmbientes({ limit: "500" }),
  });
  const tipoAmbientes: TipoAmbiente[] = useMemo(
    () =>
      tipoAmbientesRes?.status === HTTP_CODES_ENUM.OK
        ? tipoAmbientesRes.data.data
        : [],
    [tipoAmbientesRes]
  );

  const getUsers = useGetUsersService();
  const { data: professoresRes, isLoading: isLoadingProfessores } = useQuery({
    queryKey: ["professores"],
    queryFn: () =>
      getUsers({
        page: 1,
        limit: 50,
        filters: { roles: [{ id: RoleEnum.PROFESSOR }] },
      }),
  });
  const professores = useMemo(
    () =>
      professoresRes?.status === HTTP_CODES_ENUM.OK
        ? professoresRes.data.data
        : [],
    [professoresRes]
  );

  const isLoading =
    isLoadingAulas ||
    isLoadingReservas ||
    isLoadingAmbientes ||
    isLoadingUnidades ||
    isLoadingCursos ||
    isLoadingProfessores ||
    isLoadingTipos;

  const ambienteToUnidadeMap = useMemo(() => {
    const map = new Map<string, string>();
    ambientes.forEach((a) => {
      if (a.unidade?.id) map.set(a.id, a.unidade.id);
    });
    return map;
  }, [ambientes]);

  const ambientesFiltradas = useMemo(() => {
    if (unidadeFilter === "all") return ambientes;
    return ambientes.filter((a) => a.unidade?.id === unidadeFilter);
  }, [ambientes, unidadeFilter]);

  const weekDates = useMemo(() => currentWeekDates(), []);

  const dayBlocks: EnsalamentoBlock[] = useMemo(() => {
    const aulaBlocks = aulas
      .filter((a) => a.diaSemana === day)
      .map(aulaToBlock);

    const reservaBlocks = reservas
      .filter((r) => r.status === "confirmada" && r.data === weekDates[day])
      .map((r) => reservaToBlock(r, day));

    return [...aulaBlocks, ...reservaBlocks].filter((b) => {
      if (unidadeFilter !== "all") {
        if (ambienteToUnidadeMap.get(b.ambienteId) !== unidadeFilter)
          return false;
      }
      if (cursoFilter !== "all") {
        if (b.kind !== "aula") return false;
        const aula = b.raw as Aula;
        if (aula.disciplina.curso.id !== cursoFilter) return false;
      }
      if (professorFilter !== "all") {
        if (b.kind !== "aula") return false;
        const aula = b.raw as Aula;
        if (String(aula.professor.id) !== professorFilter) return false;
      }
      return true;
    });
  }, [
    aulas,
    reservas,
    day,
    weekDates,
    unidadeFilter,
    cursoFilter,
    professorFilter,
    ambienteToUnidadeMap,
  ]);

  const toggleBloco = (v: string) =>
    setBlocosSel((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  const toggleAndar = (v: string) =>
    setAndaresSel((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );

  const currentFilters: SavedViewFilters = {
    unidadeFilter,
    cursoFilter,
    professorFilter,
    groupBy,
    periodo,
    blocosSel,
    andaresSel,
    tipoFilter,
  };

  const applyView = (f: SavedViewFilters) => {
    setUnidadeFilter(f.unidadeFilter);
    setCursoFilter(f.cursoFilter);
    setProfessorFilter(f.professorFilter);
    setGroupBy(f.groupBy);
    setPeriodo(f.periodo);
    setBlocosSel(f.blocosSel);
    setAndaresSel(f.andaresSel);
    setTipoFilter(f.tipoFilter);
  };

  const handleEmptySlotClick = (ambienteId: string, horarioInicio: string) => {
    setNewSlot({ ambienteId, horarioInicio });
  };

  return (
    <>
      <AdminHeader
        title="Ensalamento"
        subtitle="Mapa de salas e grade de horários — filtre, visualize e resolva conflitos"
      />

      <div className="px-6 py-4 max-w-[1400px] mx-auto w-full space-y-4">
        {/* Top bar: day tabs, view mode, base filters */}
        <div className="bg-white p-3.5 rounded-xl border border-[#e6e5e0] shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex bg-[#efeee9] rounded-lg p-0.5">
              {DIAS_SEMANA.map((d) => (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className={`px-3.5 py-1.5 rounded-md text-[13px] transition-colors ${
                    day === d
                      ? "bg-white text-[#1a4f8a] font-bold shadow-sm"
                      : "text-[#8a9095] font-medium hover:text-[#1c1f21]"
                  }`}
                >
                  {DIA_ABREV[d]}
                </button>
              ))}
            </div>

            <div className="flex bg-[#efeee9] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("mapa")}
                className={`px-3.5 py-1.5 rounded-md text-[13px] whitespace-nowrap transition-colors ${
                  viewMode === "mapa"
                    ? "bg-white text-[#1a4f8a] font-bold shadow-sm"
                    : "text-[#8a9095] font-medium hover:text-[#1c1f21]"
                }`}
              >
                Mapa de salas
              </button>
              <button
                onClick={() => setViewMode("grade")}
                className={`px-3.5 py-1.5 rounded-md text-[13px] whitespace-nowrap transition-colors ${
                  viewMode === "grade"
                    ? "bg-white text-[#1a4f8a] font-bold shadow-sm"
                    : "text-[#8a9095] font-medium hover:text-[#1c1f21]"
                }`}
              >
                Grade de horários
              </button>
            </div>

            <Select value={unidadeFilter} onValueChange={setUnidadeFilter}>
              <SelectTrigger className="w-[170px] border-[#dddbd3] bg-white text-[13px] h-9">
                <SelectValue placeholder="Unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as unidades</SelectItem>
                {unidades.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={cursoFilter} onValueChange={setCursoFilter}>
              <SelectTrigger className="w-[170px] border-[#dddbd3] bg-white text-[13px] h-9">
                <SelectValue placeholder="Curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cursos</SelectItem>
                {cursos.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={professorFilter} onValueChange={setProfessorFilter}>
              <SelectTrigger className="w-[190px] border-[#dddbd3] bg-white text-[13px] h-9">
                <SelectValue placeholder="Professor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os professores</SelectItem>
                {professores.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.firstName} {p.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-3">
              <span className="text-[12.5px] text-[#8a9095]">
                {dayBlocks.length} {dayBlocks.length === 1 ? "aula" : "aulas"} ·{" "}
                {day}
              </span>
              <Button
                className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white h-9"
                onClick={() =>
                  handleEmptySlotClick(ambientesFiltradas[0]?.id || "", "08:00")
                }
                disabled={ambientesFiltradas.length === 0}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Nova aula
              </Button>
            </div>
          </div>

          {viewMode === "mapa" && (
            <SavedViewsBar
              views={savedViews}
              currentFilters={currentFilters}
              tipoAmbientes={tipoAmbientes}
              onApply={applyView}
              onSave={(name, role) => saveView(name, role, currentFilters)}
              onRemove={removeView}
            />
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-[#e6e5e0] shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            {viewMode === "mapa" ? (
              <MapaView
                ambientes={ambientesFiltradas}
                blocks={dayBlocks}
                unidades={unidades}
                unidadeFilter={unidadeFilter}
                onUnidadeChange={setUnidadeFilter}
                groupBy={groupBy}
                onGroupByChange={setGroupBy}
                periodo={periodo}
                onPeriodoChange={setPeriodo}
                blocosSel={blocosSel}
                onToggleBloco={toggleBloco}
                andaresSel={andaresSel}
                onToggleAndar={toggleAndar}
                tipoFilter={tipoFilter}
                onTipoChange={setTipoFilter}
                tipoAmbientes={tipoAmbientes}
                onBlockClick={setSelectedBlock}
                onEmptySlotClick={handleEmptySlotClick}
              />
            ) : (
              <GradeView
                ambientes={ambientesFiltradas}
                blocks={dayBlocks}
                onBlockClick={setSelectedBlock}
                onEmptySlotClick={handleEmptySlotClick}
              />
            )}
          </div>
        )}
      </div>

      <BlockDetailSheet
        block={selectedBlock}
        onClose={() => setSelectedBlock(null)}
        onSaved={() => setSelectedBlock(null)}
      />

      {newSlot && (
        <NewBlockSheet
          open={!!newSlot}
          onClose={() => setNewSlot(null)}
          onCreated={() => setNewSlot(null)}
          ambienteId={newSlot.ambienteId}
          diaSemana={day}
          horarioInicio={newSlot.horarioInicio}
        />
      )}
    </>
  );
}
