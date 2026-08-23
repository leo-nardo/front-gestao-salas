"use client";

import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";
import { getCourseColor } from "@/lib/course-colors";
import { EnsalamentoBlock, expandBlocksForDate } from "./types";
import { Aula } from "@/services/api/services/aulas";
import { Reserva } from "@/services/api/services/reservas";

const RESERVA_DOT_COLOR = "#5b53a6";
const MAX_DOTS = 3;

const DOW_HEADERS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

type MonthViewProps = {
  monthStart: Date;
  aulas: Aula[];
  reservas: Reserva[];
  blocks: EnsalamentoBlock[];
  onDayClick: (date: Date) => void;
};

export function MonthView({
  monthStart,
  aulas,
  reservas,
  blocks,
  onDayClick,
}: MonthViewProps) {
  // Build the 6-week grid: from Monday on/before 1st, to Sunday on/after last
  const gridDays = useMemo(() => {
    const monthS = startOfMonth(monthStart);
    const monthE = endOfMonth(monthStart);
    const gridStart = startOfWeek(monthS, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthE, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [monthStart]);

  // Pre-compute blocks per day (filtered using the parent's pre-filtered blocks set)
  const allowedIds = useMemo(
    () => new Set(blocks.map((b) => `${b.kind}-${b.id}`)),
    [blocks]
  );

  const blocksByDay = useMemo(() => {
    return gridDays.map((date) => {
      const dayBlocks = expandBlocksForDate(aulas, reservas, date);
      return dayBlocks.filter((b) => allowedIds.has(`${b.kind}-${b.id}`));
    });
  }, [gridDays, aulas, reservas, allowedIds]);

  // Split into rows of 7
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < gridDays.length; i += 7) {
      result.push(gridDays.slice(i, i + 7));
    }
    return result;
  }, [gridDays]);

  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      {/* DOW header row */}
      <div className="grid grid-cols-7 bg-surface-3 border-b">
        {DOW_HEADERS.map((dow) => (
          <div
            key={dow}
            className="py-2 text-center text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider border-r border-secondary last:border-r-0"
          >
            {dow}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {weeks.map((week, wi) => (
        <div
          key={wi}
          className="grid grid-cols-7 border-b border-secondary last:border-b-0"
        >
          {week.map((date, di) => {
            const globalIdx = wi * 7 + di;
            const dayBlocks = blocksByDay[globalIdx] ?? [];
            const inMonth = isSameMonth(date, monthStart);
            const today = isToday(date);
            const dayNum = date.getDate();
            const extraCount = Math.max(0, dayBlocks.length - MAX_DOTS);

            return (
              <button
                key={di}
                onClick={() => onDayClick(date)}
                className={`min-h-[80px] p-2 border-r border-secondary last:border-r-0 text-left flex flex-col hover:bg-info-bg/50 transition-colors ${
                  inMonth ? "" : "opacity-40"
                } ${today ? "bg-info-bg" : ""}`}
              >
                <span
                  className={`text-[12px] font-semibold self-end ${
                    today
                      ? "bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center"
                      : inMonth
                        ? "text-foreground"
                        : "text-muted-foreground/50"
                  }`}
                >
                  {dayNum}
                </span>
                {dayBlocks.length > 0 && (
                  <div className="flex items-center gap-1 mt-auto pt-1 flex-wrap">
                    {dayBlocks.slice(0, MAX_DOTS).map((b, bi) => {
                      const dotColor =
                        b.kind === "aula"
                          ? getCourseColor(b.cursoNome).border
                          : RESERVA_DOT_COLOR;
                      return (
                        <span
                          key={bi}
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: dotColor }}
                        />
                      );
                    })}
                    {extraCount > 0 && (
                      <span className="text-[10px] font-semibold text-muted-foreground/70 ml-0.5">
                        +{extraCount}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
