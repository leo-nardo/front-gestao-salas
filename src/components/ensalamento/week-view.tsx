"use client";

import { useMemo } from "react";
import { addDays, format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getCourseColor } from "@/lib/course-colors";
import { EnsalamentoBlock, expandBlocksForDate, packOverlaps } from "./types";
import { Aula } from "@/services/api/services/aulas";
import { Reserva } from "@/services/api/services/reservas";

const HOUR_START = 7;
const HOUR_END = 22;
const ROW_HEIGHT = 46;
const GRID_HEIGHT = (HOUR_END - HOUR_START) * ROW_HEIGHT;

const TURNO_BANDS = [
  { label: "Manhã", start: 7, end: 12 },
  { label: "Tarde", start: 12, end: 18 },
  { label: "Noite", start: 18, end: 22 },
];

const DIA_ABREV_CURTO: Record<number, string> = {
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
  0: "Dom",
};

function parseTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
}

function topFor(time: string) {
  return (parseTime(time) - HOUR_START) * ROW_HEIGHT;
}

type WeekViewProps = {
  weekStart: Date;
  aulas: Aula[];
  reservas: Reserva[];
  blocks: EnsalamentoBlock[];
  onBlockClick: (block: EnsalamentoBlock) => void;
  onEmptySlotClick?: (
    ambienteId: string,
    horarioInicio: string,
    date: Date
  ) => void;
  focusedAmbienteId?: string | null;
};

export function WeekView({
  weekStart,
  aulas,
  reservas,
  blocks,
  onBlockClick,
  onEmptySlotClick,
  focusedAmbienteId,
}: WeekViewProps) {
  const hourAxis = useMemo(() => {
    const hours = [];
    for (let h = HOUR_START; h <= HOUR_END; h++) hours.push(h);
    return hours;
  }, []);

  // 7 columns: Mon–Sun (Monday-start, Sunday as 7th column)
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Expand blocks per day using expandBlocksForDate then filter using
  // the pre-filtered blocks array to maintain consistency with parent filters
  const blocksByDay = useMemo(() => {
    const allowedIds = new Set(blocks.map((b) => `${b.kind}-${b.id}`));
    return weekDays.map((date) => {
      const dayBlocks = expandBlocksForDate(aulas, reservas, date);
      const filtered = dayBlocks.filter((b) =>
        allowedIds.has(`${b.kind}-${b.id}`)
      );
      return packOverlaps(filtered);
    });
  }, [weekDays, aulas, reservas, blocks]);

  const canCreate = !!focusedAmbienteId && !!onEmptySlotClick;

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

        {/* day columns */}
        {weekDays.map((date, dayIdx) => {
          const dayPacked = blocksByDay[dayIdx];
          const dayNum = date.getDate();
          const dow = date.getDay();
          const isCurrentDay = isToday(date);
          return (
            <div
              key={dayIdx}
              className={`flex-1 min-w-[130px] border-r border-secondary last:border-r-0 ${
                isCurrentDay ? "bg-info-bg/40" : ""
              }`}
            >
              <div
                className={`h-[62px] border-b px-3 py-2 flex flex-col justify-center ${
                  isCurrentDay ? "bg-info-bg/70" : "bg-surface-3"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[12.5px] font-semibold ${
                      isCurrentDay ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {DIA_ABREV_CURTO[dow]}
                  </span>
                  <span
                    className={`font-ibm-plex-mono text-[12px] ${
                      isCurrentDay
                        ? "bg-primary text-white px-1.5 py-0.5 rounded-md font-bold"
                        : "text-muted-foreground/70 font-medium"
                    }`}
                  >
                    {dayNum}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground/70 mt-0.5 capitalize">
                  {format(date, "MMM", { locale: ptBR })}
                </span>
              </div>
              <div className="relative" style={{ height: GRID_HEIGHT }}>
                {/* turno bands */}
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
                {/* hour gridlines */}
                {hourAxis.map((h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-secondary"
                    style={{ top: (h - HOUR_START) * ROW_HEIGHT }}
                  />
                ))}
                {/* event blocks */}
                {dayPacked.map((b) => {
                  const color =
                    b.kind === "aula"
                      ? getCourseColor(b.cursoNome)
                      : {
                          text: "#5b53a6",
                          bg: "#ffffff",
                          border: "#5b53a6",
                        };
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
                      className="absolute rounded-lg overflow-hidden flex flex-col text-left px-1.5 py-1 border-l-[3px] hover:brightness-[0.97] transition-all"
                      style={{
                        top,
                        height: Math.max(height, 26),
                        left: `calc(${left}% + 2px)`,
                        width: `calc(${laneWidth}% - 4px)`,
                        background: color.bg,
                        borderColor: color.border,
                        borderLeftColor: color.border,
                      }}
                    >
                      <div className="text-[11px] font-bold text-foreground leading-tight truncate">
                        {b.titulo}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {b.subtitulo}
                      </div>
                      <div className="font-ibm-plex-mono text-[9px] text-muted-foreground/70 mt-auto">
                        {b.horarioInicio}–{b.horarioFim}
                      </div>
                    </button>
                  );
                })}
                {/* empty slot buttons — only when a single room is focused */}
                {canCreate &&
                  TURNO_BANDS.filter(
                    (t) =>
                      !dayPacked.some(
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
                      className="absolute left-1 right-1 rounded-lg border border-dashed border-transparent text-muted-foreground/40 text-[10px] hover:border-info/40 hover:bg-info-bg/60 hover:text-primary transition-colors"
                      style={{
                        top: (t.start - HOUR_START) * ROW_HEIGHT + 2,
                        height: (t.end - t.start) * ROW_HEIGHT - 4,
                      }}
                    >
                      +
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
        {canCreate && (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-2.5 rounded-sm border border-dashed border-info/40 inline-block" />
            Livre · clique para reservar
          </span>
        )}
      </div>
    </div>
  );
}
