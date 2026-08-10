"use client";

import { useMemo } from "react";
import { getCourseColor } from "@/lib/course-colors";
import { EnsalamentoBlock, packOverlaps } from "./types";

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

type DayViewProps = {
  date: Date;
  blocks: EnsalamentoBlock[];
  onBlockClick: (block: EnsalamentoBlock) => void;
  onEmptySlotClick?: (
    ambienteId: string,
    horarioInicio: string,
    date: Date
  ) => void;
  focusedAmbienteId?: string | null;
};

export function DayView({
  date,
  blocks,
  onBlockClick,
  onEmptySlotClick,
  focusedAmbienteId,
}: DayViewProps) {
  const hourAxis = useMemo(() => {
    const hours = [];
    for (let h = HOUR_START; h <= HOUR_END; h++) hours.push(h);
    return hours;
  }, []);

  const packedBlocks = useMemo(() => packOverlaps(blocks), [blocks]);

  const canCreate = !!focusedAmbienteId && !!onEmptySlotClick;

  return (
    <div className="space-y-4">
      <div className="inline-flex min-w-full border border-[#e6e5e0] rounded-xl overflow-hidden bg-white">
        {/* hour axis */}
        <div className="shrink-0 w-[58px] bg-[#faf9f5] border-r border-[#e6e5e0]">
          <div className="h-[42px] border-b border-[#e6e5e0]" />
          <div className="relative" style={{ height: GRID_HEIGHT }}>
            {hourAxis.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 px-2 font-ibm-plex-mono text-[10.5px] text-[#a2a8ac] -translate-y-1/2"
                style={{ top: (h - HOUR_START) * ROW_HEIGHT }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>
        </div>

        {/* turno labels rail */}
        <div className="shrink-0 w-[40px] bg-[#fbfaf7] border-r border-[#e6e5e0]">
          <div className="h-[42px] border-b border-[#e6e5e0]" />
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
                  className="text-[10px] font-bold text-[#8a9095] uppercase tracking-wider"
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

        {/* single event column */}
        <div className="flex-1 min-w-[280px]">
          <div className="h-[42px] border-b border-[#e6e5e0] px-3 py-2 bg-[#faf9f5] flex items-center">
            <span className="text-[12.5px] font-semibold text-[#1c1f21]">
              Agenda do dia
            </span>
            <span className="ml-2 text-[11px] text-[#8a9095]">
              {blocks.length} {blocks.length === 1 ? "evento" : "eventos"}
            </span>
          </div>
          <div className="relative" style={{ height: GRID_HEIGHT }}>
            {/* turno bands */}
            {TURNO_BANDS.map((t) => (
              <div
                key={t.label}
                className="absolute left-0 right-0 bg-[#faf9f5]/60 border-t border-b border-[#f0efea]"
                style={{
                  top: (t.start - HOUR_START) * ROW_HEIGHT,
                  height: (t.end - t.start) * ROW_HEIGHT,
                }}
              />
            ))}
            {/* hour gridlines */}
            {hourAxis.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 border-t border-[#f4f3ee]"
                style={{ top: (h - HOUR_START) * ROW_HEIGHT }}
              />
            ))}
            {/* event blocks with overlap resolution */}
            {packedBlocks.map((b) => {
              const color =
                b.kind === "aula"
                  ? getCourseColor(b.cursoNome)
                  : { text: "#5b53a6", bg: "#ffffff", border: "#5b53a6" };
              const top = topFor(b.horarioInicio) + 2;
              const height =
                (parseTime(b.horarioFim) - parseTime(b.horarioInicio)) *
                  ROW_HEIGHT -
                4;
              const laneWidth = 100 / b.laneCount;
              const left = b.lane * laneWidth;
              return (
                <button
                  key={`${b.kind}-${b.id}`}
                  onClick={() => onBlockClick(b)}
                  className="absolute rounded-lg overflow-hidden flex flex-col text-left px-2.5 py-1.5 border-l-[3px] hover:brightness-[0.97] transition-all"
                  style={{
                    top,
                    height: Math.max(height, 30),
                    left: `calc(${left}% + 4px)`,
                    width: `calc(${laneWidth}% - 8px)`,
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
                  <div className="text-[12.5px] font-bold text-[#1c1f21] leading-tight truncate">
                    {b.titulo}
                  </div>
                  <div className="text-[11px] text-[#565b5e] mt-auto truncate">
                    {b.subtitulo}
                  </div>
                  <div className="font-ibm-plex-mono text-[10px] text-[#8a9095] mt-0.5">
                    {b.horarioInicio} – {b.horarioFim}
                  </div>
                </button>
              );
            })}
            {/* empty slot buttons — only when a single room is focused */}
            {canCreate &&
              TURNO_BANDS.filter(
                (t) =>
                  !blocks.some(
                    (b) =>
                      parseTime(b.horarioInicio) < t.end &&
                      parseTime(b.horarioFim) > t.start
                  )
              ).map((t) => (
                <button
                  key={t.label}
                  onClick={() =>
                    onEmptySlotClick!(
                      focusedAmbienteId!,
                      `${String(t.start).padStart(2, "0")}:00`,
                      date
                    )
                  }
                  className="absolute left-1 right-1 rounded-lg border border-dashed border-transparent text-[#cbd0d3] text-xs hover:border-[#b1c2e2] hover:bg-[#eef3fb] hover:text-[#1a4f8a] transition-colors"
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
      </div>

      <div className="flex items-center gap-4 flex-wrap text-xs text-[#8a9095]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-2.5 rounded-sm bg-[#eceef8] border-l-2 border-[#3a4a99] inline-block" />
          Aula fixa
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-2.5 rounded-sm bg-white border border-[#5b53a6] border-l-2 inline-block" />
          Reserva avulsa
        </span>
        {canCreate && (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-2.5 rounded-sm border border-dashed border-[#b1c2e2] inline-block" />
            Livre · clique para reservar
          </span>
        )}
      </div>
    </div>
  );
}
