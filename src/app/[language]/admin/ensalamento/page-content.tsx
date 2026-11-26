"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
import Search from "lucide-react/dist/esm/icons/search";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useGetBlocosService, Bloco } from "@/services/api/services/blocos";
import { useGetAndaresService, Andar } from "@/services/api/services/andares";
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
  const [tipoSel, setTipoSel] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");

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

  const getBlocos = useGetBlocosService();
  const { data: blocosRes, isLoading: isLoadingBlocos } = useQuery({
    queryKey: ["blocos", { limit: "500" }],
    queryFn: () => getBlocos({ limit: "500" }),
  });
  const blocos: Bloco[] = useMemo(
    () => (blocosRes?.status === HTTP_CODES_ENUM.OK ? blocosRes.data.data : []),
    [blocosRes]
  );

  const getAndares = useGetAndaresService();
  const { data: andaresRes, isLoading: isLoadingAndares } = useQuery({
    queryKey: ["andares", { limit: "500" }],
    queryFn: () => getAndares({ limit: "500" }),
  });
  const andares: Andar[] = useMemo(
    () =>
      andaresRes?.status === HTTP_CODES_ENUM.OK ? andaresRes.data.data : [],
    [andaresRes]
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
    isLoadingBlocos ||
    isLoadingAndares ||
    (isCalendarMode(viewMode) && isLoadingCalReservas);

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
    let base = ambientes;
    if (unidadeFilter !== "all") {
      base = base.filter((a) => a.unidade?.id === unidadeFilter);
    }
    if (ambienteFocusId) {
      base = base.filter((a) => a.id === ambienteFocusId);
    }
    if (blocosSel.length > 0) {
      base = base.filter((a) => a.bloco?.id && blocosSel.includes(a.bloco.id));
    }
    if (andaresSel.length > 0) {
      base = base.filter((a) => a.andar?.id && andaresSel.includes(a.andar.id));
    }
    if (tipoSel.length > 0) {
      base = base.filter((a) => tipoSel.includes(a.tipoAmbiente.id));
    }
    if (searchText.trim().length > 0) {
      const lower = searchText.toLowerCase();
      base = base.filter((a) => a.nome.toLowerCase().includes(lower));
    }
    return base;
  }, [
    ambientes,
    unidadeFilter,
    ambienteFocusId,
    blocosSel,
    andaresSel,
    tipoSel,
    searchText,
  ]);

  const weekDates = useMemo(() => currentWeekDates(), []);

  const ambientesFiltradasIds = useMemo(
    () => new Set(ambientesFiltradas.map((a) => a.id)),
    [ambientesFiltradas]
  );

  // Shared filter predicate used for both existing and calendar views
  const filterBlock = useCallback(
    (b: EnsalamentoBlock) => {
      if (!ambientesFiltradasIds.has(b.ambienteId)) return false;

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
    },
    [ambientesFiltradasIds, cursoFilter, professorFilter]
  );

  const dayBlocks: EnsalamentoBlock[] = useMemo(() => {
    const aulaBlocks = aulas
      .filter((a) => a.diaSemana === day)
      .map(aulaToBlock);

    const reservaBlocks = reservas
      .filter((r) => r.status === "confirmada" && r.data === weekDates[day])
      .map((r) => reservaToBlock(r, day));

    return [...aulaBlocks, ...reservaBlocks].filter(filterBlock);
  }, [aulas, reservas, day, weekDates, filterBlock]);

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
  }, [viewMode, focusDate, aulas, calReservas, filterBlock]);

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
    tipoSel,
    searchText,
  };

  const applyView = (f: SavedViewFilters) => {
    setUnidadeFilter(f.unidadeFilter);
    setCursoFilter(f.cursoFilter);
    setProfessorFilter(f.professorFilter);
    setGroupBy(f.groupBy);
    setPeriodo(f.periodo);
    setBlocosSel(f.blocosSel || []);
    setAndaresSel(f.andaresSel || []);
    setTipoSel(f.tipoSel || []);
    setSearchText(f.searchText || "");
  };

  const toggleTipo = (v: string) =>
    setTipoSel((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );

  const filtersActive =
    unidadeFilter !== "all" ||
    cursoFilter !== "all" ||
    professorFilter !== "all" ||
    blocosSel.length > 0 ||
    andaresSel.length > 0 ||
    tipoSel.length > 0 ||
    searchText !== "";

  const clearFilters = () => {
    setUnidadeFilter("all");
    setCursoFilter("all");
    setProfessorFilter("all");
    setBlocosSel([]);
    setAndaresSel([]);
    setTipoSel([]);
    setSearchText("");
    setPeriodo("Todos");
  };

  function chipClass(active: boolean) {
    return cn(
      "text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors",
      active
        ? "bg-info-bg text-primary border-info/40"
        : "bg-card text-muted-foreground border-border hover:border-muted-foreground/40"
    );
  }

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
        {/* Navigation & Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {!isCalendarMode(viewMode) && (
            <div className="flex bg-muted rounded-lg p-0.5">
              {DIAS_SEMANA.map((d) => (
                <button
                  key={d}
                  onClick={() => setDay(d)}
                  className={`px-3.5 py-1.5 rounded-md text-[13px] transition-colors ${
                    day === d
                      ? "bg-card text-primary font-bold shadow-sm"
                      : "text-muted-foreground/70 font-medium hover:text-foreground"
                  }`}
                >
                  {DIA_ABREV[d]}
                </button>
              ))}
            </div>
          )}
          {isCalendarMode(viewMode) && (
            <div className="flex items-center gap-1.5 bg-card p-1 rounded-lg border">
              <button
                onClick={navigatePrev}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground/70 hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={navigateToday}
                className="px-3 py-1.5 rounded-md text-[13px] font-semibold text-primary hover:bg-info-bg/60 transition-colors"
              >
                Hoje
              </button>
              <button
                onClick={navigateNext}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground/70 hover:text-foreground transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="ml-2 pr-2 text-[13px] font-semibold text-foreground capitalize">
                {dateLabel}
              </span>
            </div>
          )}

          <div className="flex bg-muted rounded-lg p-0.5 ml-auto">
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
                    ? "bg-card text-primary font-bold shadow-sm"
                    : "text-muted-foreground/70 font-medium hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 1: Filtros */}
        <div className="bg-card p-3.5 rounded-xl border shadow-sm flex flex-col gap-3">
          <div className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wide">
            Filtros
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                placeholder="Buscar sala..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9 h-9 w-[190px] text-[13px]"
              />
            </div>

            <Select value={unidadeFilter} onValueChange={setUnidadeFilter}>
              <SelectTrigger className="w-[170px] bg-card text-[13px] h-9">
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
              <SelectTrigger className="w-[170px] bg-card text-[13px] h-9">
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
              <SelectTrigger className="w-[190px] bg-card text-[13px] h-9">
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-info-bg border border-info/40 text-primary text-[13px] font-semibold hover:bg-info-bg/70 transition-colors"
              >
                Sala: {ambienteFocado.nome}
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="ml-auto flex items-center gap-3">
              {!isCalendarMode(viewMode) && (
                <span className="text-[12.5px] text-muted-foreground/70">
                  {dayBlocks.length} {dayBlocks.length === 1 ? "aula" : "aulas"}{" "}
                  · {day}
                </span>
              )}
              {isCalendarMode(viewMode) && (
                <span className="text-[12.5px] text-muted-foreground/70">
                  {calendarBlocks.length}{" "}
                  {calendarBlocks.length === 1 ? "evento" : "eventos"}
                </span>
              )}
              <Button
                className="bg-primary text-white h-9"
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

          <div className="flex items-center gap-1.5 flex-wrap pt-2.5 border-t">
            {blocos.map((b) => (
              <button
                key={b.id}
                onClick={() => toggleBloco(b.id)}
                className={chipClass(blocosSel.includes(b.id))}
              >
                Bloco {b.nome}
              </button>
            ))}
            {blocos.length > 0 && andares.length > 0 && (
              <span className="w-px h-4 bg-border mx-1" />
            )}
            {andares.map((a) => (
              <button
                key={a.id}
                onClick={() => toggleAndar(a.id)}
                className={chipClass(andaresSel.includes(a.id))}
              >
                {a.nome}
              </button>
            ))}
            {(blocos.length > 0 || andares.length > 0) &&
              tipoAmbientes.length > 0 && (
                <span className="w-px h-4 bg-border mx-1" />
              )}
            {tipoAmbientes.map((t) => (
              <button
                key={t.id}
                onClick={() => toggleTipo(t.id)}
                className={chipClass(tipoSel.includes(t.id))}
              >
                {t.nome}
              </button>
            ))}

            {filtersActive && (
              <button
                onClick={clearFilters}
                className="ml-auto text-xs font-semibold text-destructive hover:underline inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Visões salvas (only relevant to Mapa de salas) — Agrupar/Período live inside MapaView itself */}
        <div
          className={cn(
            "bg-card p-3.5 rounded-xl border shadow-sm flex flex-col gap-3 transition-opacity duration-200",
            viewMode !== "mapa" &&
              "opacity-0 pointer-events-none h-0 overflow-hidden !p-0 !border-0 !my-0"
          )}
        >
          <SavedViewsBar
            views={savedViews}
            currentFilters={currentFilters}
            tipoAmbientes={tipoAmbientes}
            blocos={blocos}
            andares={andares}
            onApply={applyView}
            onSave={(name, role) => saveView(name, role, currentFilters)}
            onRemove={removeView}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-card rounded-xl border shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea scrollbars="horizontal" className="pb-2">
            {viewMode === "mapa" && (
              <MapaView
                ambientes={ambientesFiltradas}
                blocks={dayBlocks}
                groupBy={groupBy}
                onGroupByChange={setGroupBy}
                periodo={periodo}
                onPeriodoChange={setPeriodo}
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
          </ScrollArea>
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
