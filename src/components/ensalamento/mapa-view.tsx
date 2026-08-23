"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Ambiente } from "@/services/api/services/ambientes";
import { EnsalamentoBlock, Turno, TURNOS, kindBadge } from "./types";
import { getCourseColor } from "@/lib/course-colors";

export type GroupBy = "bloco" | "andar" | "campus";

type MapaViewProps = {
  ambientes: Ambiente[];
  blocks: EnsalamentoBlock[];
  groupBy: GroupBy;
  onGroupByChange: (v: GroupBy) => void;
  periodo: "Todos" | Turno;
  onPeriodoChange: (v: "Todos" | Turno) => void;
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
      ? "bg-card text-primary font-bold shadow-sm"
      : "text-muted-foreground/70 font-medium hover:text-foreground"
  );
}

export function MapaView({
  ambientes,
  blocks,
  groupBy,
  onGroupByChange,
  periodo,
  onPeriodoChange,
  onBlockClick,
  onEmptySlotClick,
}: MapaViewProps) {
  const visTurnos = periodo === "Todos" ? TURNOS : [periodo];
  const visRooms = ambientes;

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
        ? (a: Ambiente) => a.andar?.nome || "Sem andar"
        : groupBy === "campus"
          ? (a: Ambiente) => a.unidade?.nome || "Sem unidade"
          : (a: Ambiente) => (a.bloco ? `Bloco ${a.bloco.nome}` : "Sem bloco");

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

  return (
    <div className="space-y-4">
      <div className="bg-surface-4 border rounded-xl p-3.5 flex flex-col gap-3 min-w-[760px]">
        <div className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wide">
          Opções do Mapa de salas
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wide">
              Agrupar por
            </span>
            <div className="flex bg-muted rounded-lg p-0.5">
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
            <span className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wide">
              Período
            </span>
            <div className="flex bg-muted rounded-lg p-0.5">
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
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden min-w-[760px]">
        <div
          className="grid border-b bg-surface-3"
          style={{
            gridTemplateColumns: `224px repeat(${visTurnos.length}, minmax(0, 1fr))`,
          }}
        >
          <div className="p-3 text-[11.5px] font-bold text-muted-foreground/70 uppercase tracking-wide">
            Sala · {visRooms.length} no total
          </div>
          {visTurnos.map((t) => (
            <div key={t} className="p-3 border-l border-secondary">
              <div className="text-[12.5px] font-bold text-muted-foreground">
                {t}
              </div>
              <div className="font-ibm-plex-mono text-[10.5px] text-muted-foreground/60 mt-0.5">
                {TURNO_RANGE[t]}
              </div>
            </div>
          ))}
        </div>

        {groups.map((g) => (
          <div key={g.key}>
            <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground bg-muted border-b flex items-center gap-2">
              <span>{g.key}</span>
              <span className="font-medium normal-case tracking-normal text-muted-foreground/60">
                · {g.rooms.length} salas
              </span>
            </div>
            {g.rooms.map((room) => {
              const cb = kindBadge(room);
              const roomBlocks = blocksByAmbiente.get(room.id) || [];
              return (
                <div
                  key={room.id}
                  className="grid border-b border-secondary min-h-[74px]"
                  style={{
                    gridTemplateColumns: `224px repeat(${visTurnos.length}, minmax(0, 1fr))`,
                  }}
                >
                  <div className="px-3.5 py-2.5 flex items-center gap-2 bg-surface-4 border-r border-secondary">
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
                      <div className="text-[11px] text-muted-foreground/60 mt-0.5 truncate">
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
                      <div key={t} className="border-l border-secondary p-1">
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
                            <div className="text-[13px] font-bold text-foreground leading-tight truncate">
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
                            className="w-full h-full min-h-[62px] rounded-lg border border-dashed border-transparent text-muted-foreground/40 text-xs hover:border-info/40 hover:bg-info-bg/60 hover:text-primary transition-colors"
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

      <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground/70">
        <span>
          <strong className="text-foreground">
            {cellTotal ? Math.round((occCount / cellTotal) * 100) : 0}%
          </strong>{" "}
          ocupado neste recorte
        </span>
      </div>
    </div>
  );
}
