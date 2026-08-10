"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  addDays,
  addWeeks,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Plus from "lucide-react/dist/esm/icons/plus";
import X from "lucide-react/dist/esm/icons/x";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
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
import { DayView } from "@/components/ensalamento/day-view";
import { WeekView } from "@/components/ensalamento/week-view";
import { MonthView } from "@/components/ensalamento/month-view";
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
  expandBlocksForDate,
  currentWeekDates,
} from "@/components/ensalamento/types";

type ViewMode = "mapa" | "grade" | "dia" | "semana" | "mes";

const isCalendarMode = (m: ViewMode) =>
  m === "dia" || m === "semana" || m === "mes";

export default function EnsalamentoPageContent() {
  const searchParams = useSearchParams();
  const [ambienteFocusId, setAmbienteFocusId] = useState<string | null>(() =>
    searchParams.get("ambiente")
  );

  const [day, setDay] = useState<DiaSemana>("Segunda");
  const [viewMode, setViewMode] = useState<ViewMode>("mapa");
  const [focusDate, setFocusDate] = useState<Date>(() => new Date());

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
    date?: Date;
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

  // Date range for calendar views (dia/semana/mes)
  const calendarDateRange = useMemo(() => {
    if (!isCalendarMode(viewMode)) return null;
    if (viewMode === "dia") {
      const d = format(focusDate, "yyyy-MM-dd");
      return { dataInicio: d, dataFim: d };
    }
    if (viewMode === "semana") {
      const ws = startOfWeek(focusDate, { weekStartsOn: 1 });
      const we = endOfWeek(focusDate, { weekStartsOn: 1 });
      return {
        dataInicio: format(ws, "yyyy-MM-dd"),
        dataFim: format(we, "yyyy-MM-dd"),
      };
    }
    // mes: full 6-week grid range
    const ms = startOfMonth(focusDate);
    const me = endOfMonth(focusDate);
    const gridStart = startOfWeek(ms, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(me, { weekStartsOn: 1 });
    return {
      dataInicio: format(gridStart, "yyyy-MM-dd"),
      dataFim: format(gridEnd, "yyyy-MM-dd"),
    };
  }, [viewMode, focusDate]);

  const { data: calReservasRes, isLoading: isLoadingCalReservas } = useQuery({
    queryKey: [
      "reservas-calendar",
      calendarDateRange?.dataInicio,
      calendarDateRange?.dataFim,
    ],
    queryFn: () =>
      getReservas({
        limit: 500,
        dataInicio: calendarDateRange!.dataInicio,
        dataFim: calendarDateRange!.dataFim,
      }),
    enabled: !!calendarDateRange,
  });
  const calReservas: Reserva[] = useMemo(
    () =>
      calReservasRes?.status === HTTP_CODES_ENUM.OK
        ? calReservasRes.data.data
        : [],
    [calReservasRes]
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
    isLoadingTipos ||
    (isCalendarMode(viewMode) && isLoadingCalReservas);

  const ambienteToUnidadeMap = useMemo(() => {
    const map = new Map<string, string>();
    ambientes.forEach((a) => {
      if (a.unidade?.id) map.set(a.id, a.unidade.id);
    });
    return map;
  }, [ambientes]);

  const ambienteFocado = useMemo(
    () =>
      ambienteFocusId
        ? (ambientes.find((a) => a.id === ambienteFocusId) ?? null)
        : null,
    [ambientes, ambienteFocusId]
  );

  // Ao chegar com ?ambiente=<id>, alinha o filtro de unidade com a sala focada
  // assim que os ambientes carregam, pra manter os controles consistentes.
  useEffect(() => {
    if (ambienteFocado && ambienteFocado.unidade?.id) {
      setUnidadeFilter(ambienteFocado.unidade.id);
    }
  }, [ambienteFocado]);

  const ambientesFiltradas = useMemo(() => {
    const base =
      unidadeFilter === "all"
        ? ambientes
        : ambientes.filter((a) => a.unidade?.id === unidadeFilter);
    if (ambienteFocusId) {
      return base.filter((a) => a.id === ambienteFocusId);
    }
    return base;
  }, [ambientes, unidadeFilter, ambienteFocusId]);

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

  // Shared filter predicate used for both existing and calendar views
  const filterBlock = (b: EnsalamentoBlock) => {
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
    if (ambienteFocusId) {
      if (b.ambienteId !== ambienteFocusId) return false;
    }
    return true;
  };

  // Blocks for calendar views (dia/semana/mes) — expanded from aulas + calReservas
  const calendarBlocks: EnsalamentoBlock[] = useMemo(() => {
    if (!isCalendarMode(viewMode)) return [];
    if (viewMode === "dia") {
      return expandBlocksForDate(aulas, calReservas, focusDate).filter(
        filterBlock
      );
    }
    // semana & mes: blocks are expanded per-day inside the child components,
    // but we still provide a flat filtered list they can intersect with.
    // For week: expand Mon–Sun of focusDate's week
    if (viewMode === "semana") {
      const ws = startOfWeek(focusDate, { weekStartsOn: 1 });
      const allBlocks: EnsalamentoBlock[] = [];
      for (let i = 0; i < 7; i++) {
        const d = addDays(ws, i);
        allBlocks.push(...expandBlocksForDate(aulas, calReservas, d));
      }
      return allBlocks.filter(filterBlock);
    }
    // mes: expand all grid days
    const ms = startOfMonth(focusDate);
    const me = endOfMonth(focusDate);
    const gridStart = startOfWeek(ms, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(me, { weekStartsOn: 1 });
    const allBlocks: EnsalamentoBlock[] = [];
    let cur = gridStart;
    while (cur <= gridEnd) {
      allBlocks.push(...expandBlocksForDate(aulas, calReservas, cur));
      cur = addDays(cur, 1);
    }
    return allBlocks.filter(filterBlock);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    viewMode,
    focusDate,
    aulas,
    calReservas,
    unidadeFilter,
    cursoFilter,
    professorFilter,
    ambienteFocusId,
    ambienteToUnidadeMap,
  ]);

  // Calendar week start for week view
  const calendarWeekStart = useMemo(
    () => startOfWeek(focusDate, { weekStartsOn: 1 }),
    [focusDate]
  );

  // Calendar month start for month view
  const calendarMonthStart = useMemo(
    () => startOfMonth(focusDate),
    [focusDate]
  );

  // Date navigation helpers
  const navigatePrev = () => {
    if (viewMode === "dia") setFocusDate((d) => addDays(d, -1));
    else if (viewMode === "semana") setFocusDate((d) => addWeeks(d, -1));
    else if (viewMode === "mes") setFocusDate((d) => addMonths(d, -1));
  };
  const navigateNext = () => {
    if (viewMode === "dia") setFocusDate((d) => addDays(d, 1));
    else if (viewMode === "semana") setFocusDate((d) => addWeeks(d, 1));
    else if (viewMode === "mes") setFocusDate((d) => addMonths(d, 1));
  };
  const navigateToday = () => setFocusDate(new Date());

  const dateLabel = useMemo(() => {
    if (viewMode === "dia") {
      return format(focusDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
    if (viewMode === "semana") {
      const ws = startOfWeek(focusDate, { weekStartsOn: 1 });
      const we = endOfWeek(focusDate, { weekStartsOn: 1 });
      const startStr = format(ws, "d", { locale: ptBR });
      const endStr = format(we, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
      return `${startStr}–${endStr}`;
    }
    if (viewMode === "mes") {
      return format(focusDate, "MMMM 'de' yyyy", { locale: ptBR });
    }
    return "";
  }, [viewMode, focusDate]);

  // DiaSemana for the focused date (used by NewBlockSheet in calendar views)
  const focusDateDiaSemana: DiaSemana = useMemo(() => {
    const idx = focusDate.getDay();
    return idx === 0 ? "Segunda" : DIAS_SEMANA[idx - 1];
  }, [focusDate]);

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

  const handleEmptySlotClick = (
    ambienteId: string,
    horarioInicio: string,
    date?: Date
  ) => {
    setNewSlot({ ambienteId, horarioInicio, date });
  };

  const newSlotDiaSemana: DiaSemana = useMemo(() => {
    if (newSlot?.date) {
      const idx = newSlot.date.getDay();
      return idx === 0 ? "Segunda" : DIAS_SEMANA[idx - 1];
    }
    return isCalendarMode(viewMode) ? focusDateDiaSemana : day;
  }, [newSlot, viewMode, focusDateDiaSemana, day]);

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
            {/* Weekday tabs — hidden in calendar views */}
            {!isCalendarMode(viewMode) && (
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
            )}

            {/* Date navigation — shown only in calendar views */}
            {isCalendarMode(viewMode) && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={navigatePrev}
                  className="p-1.5 rounded-md hover:bg-[#efeee9] text-[#8a9095] hover:text-[#1c1f21] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={navigateToday}
                  className="px-3 py-1.5 rounded-md text-[13px] font-semibold text-[#1a4f8a] hover:bg-[#eaf0fa] transition-colors"
                >
                  Hoje
                </button>
                <button
                  onClick={navigateNext}
                  className="p-1.5 rounded-md hover:bg-[#efeee9] text-[#8a9095] hover:text-[#1c1f21] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="ml-2 text-[13px] font-semibold text-[#1c1f21] capitalize">
                  {dateLabel}
                </span>
              </div>
            )}

            <div className="flex bg-[#efeee9] rounded-lg p-0.5">
              {[
                { key: "mapa" as ViewMode, label: "Mapa de salas" },
                { key: "grade" as ViewMode, label: "Grade de horários" },
                { key: "dia" as ViewMode, label: "Dia" },
                { key: "semana" as ViewMode, label: "Semana" },
                { key: "mes" as ViewMode, label: "Mês" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setViewMode(tab.key)}
                  className={`px-3.5 py-1.5 rounded-md text-[13px] whitespace-nowrap transition-colors ${
                    viewMode === tab.key
                      ? "bg-white text-[#1a4f8a] font-bold shadow-sm"
                      : "text-[#8a9095] font-medium hover:text-[#1c1f21]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
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

            {ambienteFocado && (
              <button
                onClick={() => setAmbienteFocusId(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e7edf8] border border-[#b1c2e2] text-[#1a4f8a] text-[13px] font-semibold hover:bg-[#dbe6f6] transition-colors"
              >
                Sala: {ambienteFocado.nome}
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="ml-auto flex items-center gap-3">
              {!isCalendarMode(viewMode) && (
                <span className="text-[12.5px] text-[#8a9095]">
                  {dayBlocks.length} {dayBlocks.length === 1 ? "aula" : "aulas"}{" "}
                  · {day}
                </span>
              )}
              {isCalendarMode(viewMode) && (
                <span className="text-[12.5px] text-[#8a9095]">
                  {calendarBlocks.length}{" "}
                  {calendarBlocks.length === 1 ? "evento" : "eventos"}
                </span>
              )}
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
            {viewMode === "mapa" && (
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
            )}
            {viewMode === "grade" && (
              <GradeView
                ambientes={ambientesFiltradas}
                blocks={dayBlocks}
                onBlockClick={setSelectedBlock}
                onEmptySlotClick={handleEmptySlotClick}
              />
            )}
            {viewMode === "dia" && (
              <DayView
                date={focusDate}
                blocks={calendarBlocks}
                onBlockClick={setSelectedBlock}
                onEmptySlotClick={
                  ambienteFocusId ? handleEmptySlotClick : undefined
                }
                focusedAmbienteId={ambienteFocusId}
              />
            )}
            {viewMode === "semana" && (
              <WeekView
                weekStart={calendarWeekStart}
                aulas={aulas}
                reservas={calReservas}
                blocks={calendarBlocks}
                onBlockClick={setSelectedBlock}
                onEmptySlotClick={
                  ambienteFocusId ? handleEmptySlotClick : undefined
                }
                focusedAmbienteId={ambienteFocusId}
              />
            )}
            {viewMode === "mes" && (
              <MonthView
                monthStart={calendarMonthStart}
                aulas={aulas}
                reservas={calReservas}
                blocks={calendarBlocks}
                onDayClick={(date) => {
                  setFocusDate(date);
                  setViewMode("dia");
                }}
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
          diaSemana={newSlotDiaSemana}
          horarioInicio={newSlot.horarioInicio}
          date={newSlot.date}
        />
      )}
    </>
  );
}
