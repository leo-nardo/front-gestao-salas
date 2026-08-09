"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Ambiente } from "@/services/api/services/ambientes";
import { Unidade } from "@/services/api/services/unidades";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw";
import { EnsalamentoBlock, Turno, TURNOS, kindBadge } from "./types";
import { getCourseColor } from "@/lib/course-colors";

export type GroupBy = "bloco" | "andar" | "campus";

type MapaViewProps = {
  ambientes: Ambiente[];
  blocks: EnsalamentoBlock[];
  unidades: Unidade[];
  unidadeFilter: string;
  onUnidadeChange: (v: string) => void;
  groupBy: GroupBy;
  onGroupByChange: (v: GroupBy) => void;
  periodo: "Todos" | Turno;
  onPeriodoChange: (v: "Todos" | Turno) => void;
  blocosSel: string[];
  onToggleBloco: (v: string) => void;
  andaresSel: string[];
  onToggleAndar: (v: string) => void;
  tipoFilter: "Todos" | "Sala" | "Laboratório";
  onTipoChange: (v: "Todos" | "Sala" | "Laboratório") => void;
  onBlockClick: (block: EnsalamentoBlock) => void;
  onEmptySlotClick: (ambienteId: string, horarioInicio: string) => void;
};

const TURNO_RANGE: Record<Turno, string> = {
  Manhã: "07:00 – 12:00",
  Tarde: "12:00 – 18:00",
  Noite: "18:00 – 22:00",
};

function tabClass(active: boolean) {
  return cn(
    "px-3 py-1.5 rounded-md text-[12.5px] whitespace-nowrap transition-colors",
    active
      ? "bg-white text-[#1a4f8a] font-bold shadow-sm"
      : "text-[#8a9095] font-medium hover:text-[#1c1f21]"
  );
}

function chipClass(active: boolean) {
  return cn(
    "text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors",
    active
      ? "bg-[#e7edf8] text-[#1a4f8a] border-[#b1c2e2]"
      : "bg-white text-[#6f767b] border-[#e0ded6] hover:border-[#c7c4b9]"
  );
}

export function MapaView({
  ambientes,
  blocks,
  unidades,
  unidadeFilter,
  onUnidadeChange,
  groupBy,
  onGroupByChange,
  periodo,
  onPeriodoChange,
  blocosSel,
  onToggleBloco,
  andaresSel,
  onToggleAndar,
  tipoFilter,
  onTipoChange,
  onBlockClick,
  onEmptySlotClick,
}: MapaViewProps) {
  const blocosDisponiveis = useMemo(
    () =>
      Array.from(
        new Set(ambientes.map((a) => a.bloco).filter(Boolean))
      ) as string[],
    [ambientes]
  );
  const andaresDisponiveis = useMemo(
    () =>
      Array.from(
        new Set(ambientes.map((a) => a.andar).filter(Boolean))
      ) as string[],
    [ambientes]
  );

  const visTurnos = periodo === "Todos" ? TURNOS : [periodo];

  const visRooms = useMemo(() => {
    return ambientes.filter((a) => {
      if (blocosSel.length && !blocosSel.includes(a.bloco || "")) return false;
      if (andaresSel.length && !andaresSel.includes(a.andar || ""))
        return false;
      if (tipoFilter !== "Todos" && a.categoria !== tipoFilter) return false;
      return true;
    });
  }, [ambientes, blocosSel, andaresSel, tipoFilter]);

  const blocksByAmbiente = useMemo(() => {
    const map = new Map<string, EnsalamentoBlock[]>();
    blocks.forEach((b) => {
      const list = map.get(b.ambienteId) || [];
      list.push(b);
      map.set(b.ambienteId, list);
    });
    return map;
  }, [blocks]);

  const groups = useMemo(() => {
    const keyFn =
      groupBy === "andar"
        ? (a: Ambiente) => a.andar || "Sem andar"
        : groupBy === "campus"
          ? (a: Ambiente) => a.unidade?.nome || "Sem unidade"
          : (a: Ambiente) => (a.bloco ? `Bloco ${a.bloco}` : "Sem bloco");

    const order: string[] = [];
    const map: Record<string, Ambiente[]> = {};
    visRooms.forEach((a) => {
      const k = keyFn(a);
      if (!map[k]) {
        map[k] = [];
        order.push(k);
      }
      map[k].push(a);
    });
    return order.map((k) => ({ key: k, rooms: map[k] }));
  }, [visRooms, groupBy]);

  let occCount = 0;
  let cellTotal = 0;

  const filtersActive =
    blocosSel.length > 0 || andaresSel.length > 0 || tipoFilter !== "Todos";

  const clearFilters = () => {
    blocosSel.forEach((b) => onToggleBloco(b));
    andaresSel.forEach((a) => onToggleAndar(a));
    onTipoChange("Todos");
    onPeriodoChange("Todos");
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#e6e5e0] rounded-xl p-3.5 flex flex-col gap-3 min-w-[760px]">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#8a9095] uppercase tracking-wide">
              Agrupar
            </span>
            <div className="flex bg-[#efeee9] rounded-lg p-0.5">
              {(
                [
                  ["bloco", "Bloco"],
                  ["andar", "Andar"],
                  ["campus", "Campus"],
                ] as [GroupBy, string][]
              ).map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => onGroupByChange(v)}
                  className={tabClass(groupBy === v)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#8a9095] uppercase tracking-wide">
              Período
            </span>
            <div className="flex bg-[#efeee9] rounded-lg p-0.5">
              {(["Todos", "Manhã", "Tarde", "Noite"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => onPeriodoChange(p)}
                  className={tabClass(periodo === p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#8a9095] uppercase tracking-wide">
              Campus
            </span>
            <div className="flex bg-[#efeee9] rounded-lg p-0.5">
              <button
                onClick={() => onUnidadeChange("all")}
                className={tabClass(unidadeFilter === "all")}
              >
                Todos os campi
              </button>
              {unidades.map((u) => (
                <button
                  key={u.id}
                  onClick={() => onUnidadeChange(u.id)}
                  className={tabClass(unidadeFilter === u.id)}
                >
                  {u.nome}
                </button>
              ))}
            </div>
          </div>
          {filtersActive && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs font-semibold text-[#a8442f] hover:underline inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Limpar filtros
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap pt-2.5 border-t border-[#f0efea]">
          <span className="text-[11px] font-bold text-[#8a9095] uppercase tracking-wide mr-1">
            Filtrar
          </span>
          {blocosDisponiveis.map((b) => (
            <button
              key={b}
              onClick={() => onToggleBloco(b)}
              className={chipClass(blocosSel.includes(b))}
            >
              Bloco {b}
            </button>
          ))}
          {blocosDisponiveis.length > 0 && andaresDisponiveis.length > 0 && (
            <span className="w-px h-4 bg-[#e6e5e0] mx-1" />
          )}
          {andaresDisponiveis.map((a) => (
            <button
              key={a}
              onClick={() => onToggleAndar(a)}
              className={chipClass(andaresSel.includes(a))}
            >
              {a}
            </button>
          ))}
          <span className="w-px h-4 bg-[#e6e5e0] mx-1" />
          {(["Sala", "Laboratório"] as const).map((t) => (
            <button
              key={t}
              onClick={() => onTipoChange(tipoFilter === t ? "Todos" : t)}
              className={chipClass(tipoFilter === t)}
            >
              {t === "Sala" ? "Sala comum" : "Laboratório"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#e6e5e0] rounded-xl overflow-hidden min-w-[760px]">
        <div
          className="grid border-b border-[#e6e5e0] bg-[#faf9f5]"
          style={{
            gridTemplateColumns: `224px repeat(${visTurnos.length}, minmax(0, 1fr))`,
          }}
        >
          <div className="p-3 text-[11.5px] font-bold text-[#8a9095] uppercase tracking-wide">
            Sala · {visRooms.length} no total
          </div>
          {visTurnos.map((t) => (
            <div key={t} className="p-3 border-l border-[#f0efea]">
              <div className="text-[12.5px] font-bold text-[#565b5e]">{t}</div>
              <div className="font-ibm-plex-mono text-[10.5px] text-[#a2a8ac] mt-0.5">
                {TURNO_RANGE[t]}
              </div>
            </div>
          ))}
        </div>

        {groups.map((g) => (
          <div key={g.key}>
            <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#6f767b] bg-[#f2f1ec] border-b border-[#e6e5e0] flex items-center gap-2">
              <span>{g.key}</span>
              <span className="font-medium normal-case tracking-normal text-[#a2a8ac]">
                · {g.rooms.length} salas
              </span>
            </div>
            {g.rooms.map((room) => {
              const cb = kindBadge(room);
              const roomBlocks = blocksByAmbiente.get(room.id) || [];
              return (
                <div
                  key={room.id}
                  className="grid border-b border-[#f0efea] min-h-[74px]"
                  style={{
                    gridTemplateColumns: `224px repeat(${visTurnos.length}, minmax(0, 1fr))`,
                  }}
                >
                  <div className="px-3.5 py-2.5 flex items-center gap-2 bg-[#fbfaf7] border-r border-[#f0efea]">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-ibm-plex-mono text-[13px] font-semibold">
                          {room.nome}
                        </span>
                        <span
                          className="text-[9px] font-bold uppercase px-1 rounded"
                          style={{ color: cb.fg, background: cb.bg }}
                        >
                          {cb.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#a2a8ac] mt-0.5 truncate">
                        {room.capacidade} lug.
                      </div>
                    </div>
                  </div>
                  {visTurnos.map((t) => {
                    cellTotal++;
                    const block = roomBlocks.find((b) => b.turno === t);
                    if (block) occCount++;
                    const color = block
                      ? block.kind === "aula"
                        ? getCourseColor(block.cursoNome)
                        : { text: "#5b53a6", bg: "#ffffff", border: "#5b53a6" }
                      : null;
                    return (
                      <div key={t} className="border-l border-[#f0efea] p-1">
                        {block ? (
                          <button
                            onClick={() => onBlockClick(block)}
                            className="w-full h-full min-h-[62px] rounded-lg px-2.5 py-2 flex flex-col justify-center text-left border-l-[3px] hover:brightness-[0.97] transition-all"
                            style={{
                              background: color!.bg,
                              borderColor: color!.border,
                              borderLeftColor: color!.border,
                            }}
                          >
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span
                                className="w-2 h-2 rounded-sm shrink-0"
                                style={{ background: color!.border }}
                              />
                              <span
                                className="font-ibm-plex-mono text-[10px] font-semibold"
                                style={{ color: color!.border }}
                              >
                                {block.subtitulo.split(" · ")[0]}
                              </span>
                            </div>
                            <div className="text-[13px] font-bold text-[#1c1f21] leading-tight truncate">
                              {block.titulo}
                            </div>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              onEmptySlotClick(
                                room.id,
                                `${String(
                                  t === "Manhã" ? 7 : t === "Tarde" ? 12 : 18
                                ).padStart(2, "0")}:00`
                              )
                            }
                            className="w-full h-full min-h-[62px] rounded-lg border border-dashed border-transparent text-[#cbd0d3] text-xs hover:border-[#b1c2e2] hover:bg-[#eef3fb] hover:text-[#1a4f8a] transition-colors"
                          >
                            + reservar
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 flex-wrap text-xs text-[#8a9095]">
        <span>
          <strong className="text-[#1c1f21]">
            {cellTotal ? Math.round((occCount / cellTotal) * 100) : 0}%
          </strong>{" "}
          ocupado neste recorte
        </span>
      </div>
    </div>
  );
}
