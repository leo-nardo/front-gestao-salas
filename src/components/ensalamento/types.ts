import { Aula, DiaSemana } from "@/services/api/services/aulas";
import { Reserva } from "@/services/api/services/reservas";
import { Ambiente } from "@/services/api/services/ambientes";

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
  const day = today.getDay(); // 0 = Sunday
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const toIso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const result = {} as Record<DiaSemana, string>;
  DIAS_SEMANA.forEach((dia, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    result[dia] = toIso(d);
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

export function kindBadge(ambiente: Pick<Ambiente, "categoria">) {
  if (ambiente.categoria === "Laboratório") {
    return { label: "Laboratório", fg: "#a8442f", bg: "#f7e7e2" };
  }
  return { label: "Sala", fg: "#3a4a99", bg: "#eceef8" };
}
