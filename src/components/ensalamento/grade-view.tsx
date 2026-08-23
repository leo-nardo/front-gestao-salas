"use client";

import { useMemo } from "react";
import { Ambiente } from "@/services/api/services/ambientes";
import { getCourseColor } from "@/lib/course-colors";
import { EnsalamentoBlock, kindBadge } from "./types";

const HOUR_START = 7;
const HOUR_END = 22;
const ROW_HEIGHT = 46;
const GRID_HEIGHT = (HOUR_END - HOUR_START) * ROW_HEIGHT;

const TURNO_BANDS = [
  { label: "Manhã", start: 7, end: 12 },
  { label: "Tarde", start: 12, end: 18 },
  { label: "Noite", start: 18, end: 22 },
];

function parseTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
}

function topFor(time: string) {
  return (parseTime(time) - HOUR_START) * ROW_HEIGHT;
}

type GradeViewProps = {
  ambientes: Ambiente[];
  blocks: EnsalamentoBlock[];
  onBlockClick: (block: EnsalamentoBlock) => void;
  onEmptySlotClick: (ambienteId: string, horarioInicio: string) => void;
};

export function GradeView({
  ambientes,
  blocks,
  onBlockClick,
  onEmptySlotClick,
}: GradeViewProps) {
  const hourAxis = useMemo(() => {
    const hours = [];
    for (let h = HOUR_START; h <= HOUR_END; h++) hours.push(h);
    return hours;
  }, []);

  const blocksByAmbiente = useMemo(() => {
    const map = new Map<string, EnsalamentoBlock[]>();
    blocks.forEach((b) => {
      const list = map.get(b.ambienteId) || [];
      list.push(b);
      map.set(b.ambienteId, list);
    });
    return map;
  }, [blocks]);

  if (ambientes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex min-w-full border rounded-xl overflow-hidden bg-card">
        {/* hour axis */}
        <div className="shrink-0 w-[58px] bg-surface-3 border-r">
          <div className="h-[62px] border-b" />
          <div className="relative" style={{ height: GRID_HEIGHT }}>
            {hourAxis.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 px-2 font-ibm-plex-mono text-[10.5px] text-muted-foreground/60 -translate-y-1/2"
                style={{ top: (h - HOUR_START) * ROW_HEIGHT }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>
        </div>

        {/* turno labels rail */}
        <div className="shrink-0 w-[40px] bg-surface-4 border-r">
          <div className="h-[62px] border-b" />
          <div className="relative" style={{ height: GRID_HEIGHT }}>
            {TURNO_BANDS.map((t) => (
              <div
                key={t.label}
                className="absolute left-0 right-0 flex items-center justify-center"
                style={{
                  top: (t.start - HOUR_START) * ROW_HEIGHT,
                  height: (t.end - t.start) * ROW_HEIGHT,
                }}
              >
                <span
                  className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider"
                  style={{
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                  }}
                >
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* room columns */}
        {ambientes.map((amb) => {
          const cb = kindBadge(amb);
          const ambBlocks = blocksByAmbiente.get(amb.id) || [];
          return (
            <div
              key={amb.id}
              className="flex-1 min-w-[190px] border-r border-secondary last:border-r-0"
            >
              <div className="h-[62px] border-b px-3 py-2 bg-surface-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-ibm-plex-mono text-[12.5px] font-semibold">
                    {amb.nome}
                  </span>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wide px-1 rounded"
                    style={{ color: cb.fg, background: cb.bg }}
                  >
                    {cb.label}
                  </span>
                </div>
                <div className="text-[11.5px] text-muted-foreground/70 mt-0.5 truncate">
                  {amb.capacidade} lug.
                </div>
              </div>
              <div className="relative" style={{ height: GRID_HEIGHT }}>
                {TURNO_BANDS.map((t) => (
                  <div
                    key={t.label}
                    className="absolute left-0 right-0 bg-surface-3/60 border-t border-b border-secondary"
                    style={{
                      top: (t.start - HOUR_START) * ROW_HEIGHT,
                      height: (t.end - t.start) * ROW_HEIGHT,
                    }}
                  />
                ))}
                {hourAxis.map((h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-secondary"
                    style={{ top: (h - HOUR_START) * ROW_HEIGHT }}
                  />
                ))}
                {ambBlocks.map((b) => {
                  const color =
                    b.kind === "aula"
                      ? getCourseColor(b.cursoNome)
                      : { text: "#5b53a6", bg: "#ffffff", border: "#5b53a6" };
                  const top = topFor(b.horarioInicio) + 2;
                  const height =
                    (parseTime(b.horarioFim) - parseTime(b.horarioInicio)) *
                      ROW_HEIGHT -
                    4;
                  return (
                    <button
                      key={`${b.kind}-${b.id}`}
                      onClick={() => onBlockClick(b)}
                      className="absolute left-1 right-1 rounded-lg overflow-hidden flex flex-col text-left px-2.5 py-1.5 border-l-[3px] hover:brightness-[0.97] transition-all"
                      style={{
                        top,
                        height: Math.max(height, 30),
                        background: color.bg,
                        borderColor: color.border,
                        borderLeftColor: color.border,
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className="w-2 h-2 rounded-sm shrink-0"
                          style={{ background: color.border }}
                        />
                        <span
                          className="font-ibm-plex-mono text-[9.5px] font-semibold truncate"
                          style={{ color: color.border }}
                        >
                          {b.kind === "aula" ? "Fixa" : "Reserva"}
                        </span>
                      </div>
                      <div className="text-[12.5px] font-bold text-foreground leading-tight truncate">
                        {b.titulo}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-auto truncate">
                        {b.subtitulo}
                      </div>
                    </button>
                  );
                })}
                {/* empty slot buttons — one per turno band without a block */}
                {TURNO_BANDS.filter(
                  (t) =>
                    !ambBlocks.some(
                      (b) =>
                        parseTime(b.horarioInicio) < t.end &&
                        parseTime(b.horarioFim) > t.start
                    )
                ).map((t) => (
                  <button
                    key={t.label}
                    onClick={() =>
                      onEmptySlotClick(
                        amb.id,
                        `${String(t.start).padStart(2, "0")}:00`
                      )
                    }
                    className="absolute left-1 right-1 rounded-lg border border-dashed border-transparent text-muted-foreground/40 text-xs hover:border-info/40 hover:bg-info-bg/60 hover:text-primary transition-colors"
                    style={{
                      top: (t.start - HOUR_START) * ROW_HEIGHT + 2,
                      height: (t.end - t.start) * ROW_HEIGHT - 4,
                    }}
                  >
                    + reservar
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground/70">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-2.5 rounded-sm bg-[#eceef8] border-l-2 border-[#3a4a99] inline-block" />
          Aula fixa
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-2.5 rounded-sm bg-card border border-[#5b53a6] border-l-2 inline-block" />
          Reserva avulsa
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 h-2.5 rounded-sm border border-dashed border-info/40 inline-block" />
          Livre · clique para reservar
        </span>
      </div>
    </div>
  );
}
