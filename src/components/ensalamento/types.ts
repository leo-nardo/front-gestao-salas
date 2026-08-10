import { startOfWeek, addDays, format } from "date-fns";
import { Aula, DiaSemana } from "@/services/api/services/aulas";
import { Reserva } from "@/services/api/services/reservas";
import { Ambiente } from "@/services/api/services/ambientes";
import { getTipoAmbienteBadgeColors } from "@/lib/tipo-ambiente-colors";

export const DIAS_SEMANA: DiaSemana[] = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export const DIA_ABREV: Record<DiaSemana, string> = {
  Segunda: "Seg",
  Terça: "Ter",
  Quarta: "Qua",
  Quinta: "Qui",
  Sexta: "Sex",
  Sábado: "Sáb",
};

export type Turno = "Manhã" | "Tarde" | "Noite";
export const TURNOS: Turno[] = ["Manhã", "Tarde", "Noite"];

export function turnoOf(horarioInicio: string): Turno {
  const hour = parseInt(horarioInicio.split(":")[0], 10);
  if (hour < 12) return "Manhã";
  if (hour < 18) return "Tarde";
  return "Noite";
}

/** Monday..Saturday ISO dates (YYYY-MM-DD) for the week containing `today`. */
export function currentWeekDates(
  today: Date = new Date()
): Record<DiaSemana, string> {
  const monday = startOfWeek(today, { weekStartsOn: 1 });

  const result = {} as Record<DiaSemana, string>;
  DIAS_SEMANA.forEach((dia, i) => {
    const d = addDays(monday, i);
    result[dia] = format(d, "yyyy-MM-dd");
  });
  return result;
}

export type BlockKind = "aula" | "reserva";

/** Unified shape for rendering an Aula or a Reserva on the same grid. */
export type EnsalamentoBlock = {
  id: string;
  kind: BlockKind;
  ambienteId: string;
  diaSemana: DiaSemana;
  horarioInicio: string;
  horarioFim: string;
  titulo: string;
  subtitulo: string;
  cursoNome?: string;
  turno: Turno;
  raw: Aula | Reserva;
};

export function aulaToBlock(aula: Aula): EnsalamentoBlock {
  return {
    id: aula.id,
    kind: "aula",
    ambienteId: aula.ambiente.id,
    diaSemana: aula.diaSemana,
    horarioInicio: aula.horarioInicio,
    horarioFim: aula.horarioFim,
    titulo: aula.disciplina.nome,
    subtitulo: `${aula.turma.codigo} · ${aula.professor.firstName} ${aula.professor.lastName}`,
    cursoNome: aula.disciplina.curso.nome,
    turno: turnoOf(aula.horarioInicio),
    raw: aula,
  };
}

export function reservaToBlock(
  reserva: Reserva,
  diaSemana: DiaSemana
): EnsalamentoBlock {
  return {
    id: reserva.id,
    kind: "reserva",
    ambienteId: reserva.ambiente.id,
    diaSemana,
    horarioInicio: reserva.horarioInicio,
    horarioFim: reserva.horarioFim,
    titulo: reserva.titulo,
    subtitulo: `${reserva.solicitante.firstName} ${reserva.solicitante.lastName}`,
    turno: turnoOf(reserva.horarioInicio),
    raw: reserva,
  };
}

export type AmbienteWithMeta = Ambiente;

export function kindBadge(ambiente: Pick<Ambiente, "tipoAmbiente">) {
  return getTipoAmbienteBadgeColors(ambiente.tipoAmbiente.nome);
}

export function expandBlocksForDate(
  aulas: Aula[],
  reservas: Reserva[],
  date: Date
): EnsalamentoBlock[] {
  const dayIndex = date.getDay(); // 0 = Sunday
  const isSunday = dayIndex === 0;
  // Sunday has no matching DiaSemana (DIAS_SEMANA only covers Mon–Sat).
  // Use "Segunda" as a fallback label for reservas on Sundays (display-only).
  const diaSemana: DiaSemana = isSunday ? "Segunda" : DIAS_SEMANA[dayIndex - 1];

  // No aulas on Sunday since DIAS_SEMANA excludes it
  const aulaBlocks = isSunday
    ? []
    : aulas.filter((a) => a.diaSemana === diaSemana).map(aulaToBlock);

  const reservaDateStr = format(date, "yyyy-MM-dd");
  const reservaBlocks = reservas
    .filter((r) => r.status === "confirmada" && r.data === reservaDateStr)
    .map((r) => reservaToBlock(r, diaSemana));

  return [...aulaBlocks, ...reservaBlocks];
}

export function packOverlaps(
  blocks: EnsalamentoBlock[]
): (EnsalamentoBlock & { lane: number; laneCount: number })[] {
  const sorted = [...blocks].sort((a, b) =>
    a.horarioInicio.localeCompare(b.horarioInicio)
  );
  const lanes: string[] = [];
  const assignments: { block: EnsalamentoBlock; lane: number }[] = [];

  for (const block of sorted) {
    let laneFound = false;
    for (let i = 0; i < lanes.length; i++) {
      if (lanes[i] <= block.horarioInicio) {
        lanes[i] = block.horarioFim;
        assignments.push({ block, lane: i });
        laneFound = true;
        break;
      }
    }
    if (!laneFound) {
      lanes.push(block.horarioFim);
      assignments.push({ block, lane: lanes.length - 1 });
    }
  }

  const laneCount = lanes.length;
  return assignments.map((a) => ({
    ...a.block,
    lane: a.lane,
    laneCount,
  }));
}
