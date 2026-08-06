import React from "react";
import { Aula, DiaSemana } from "@/services/api/services/aulas";

const diasSemana: DiaSemana[] = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
];

const courseColors: Record<
  string,
  { text: string; bg: string; border: string }
> = {
  Direito: { text: "#3a4a99", bg: "#eceef8", border: "#3a4a99" },
  Administração: { text: "#8a5a1a", bg: "#f6eede", border: "#8a5a1a" },
  Enfermagem: { text: "#0e6b62", bg: "#e2f0ee", border: "#0e6b62" },
  Biomedicina: { text: "#a8442f", bg: "#f7e7e2", border: "#a8442f" },
  "Eng. de Software": { text: "#5b53a6", bg: "#ecebf7", border: "#5b53a6" },
};

type WeekScheduleGridProps = {
  aulas: Aula[];
};

export function WeekScheduleGrid({ aulas }: WeekScheduleGridProps) {
  const hours = Array.from({ length: 16 }, (_, i) => i + 7); // 7:00 to 22:00
  const days = diasSemana; // Segunda a Sexta

  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h + m / 60;
  };

  return (
    <div className="bg-white rounded-xl border border-[#e6e5e0] overflow-hidden shadow-sm">
      <div className="grid grid-cols-6 border-b border-[#e6e5e0] bg-[#faf9f5]">
        <div className="p-3 text-center border-r border-[#e6e5e0] text-sm font-semibold text-[#6f767b]">
          Horário
        </div>
        {days.map((day) => (
          <div
            key={day}
            className="p-3 text-center border-r last:border-r-0 border-[#e6e5e0] text-sm font-semibold text-[#1c1f21]"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="relative" style={{ height: `${hours.length * 60}px` }}>
        {/* Grid lines */}
        {hours.map((hour, i) => (
          <div
            key={hour}
            className="absolute w-full border-t border-[#f0efea] flex"
            style={{ top: `${i * 60}px`, height: "60px" }}
          >
            <div className="w-[16.666%] border-r border-[#e6e5e0] flex items-start justify-center pt-2">
              <span className="text-xs font-ibm-plex-mono text-[#8a9095]">
                {hour.toString().padStart(2, "0")}:00
              </span>
            </div>
            {days.map((day) => (
              <div
                key={day}
                className="w-[16.666%] border-r last:border-r-0 border-[#f0efea]"
              ></div>
            ))}
          </div>
        ))}

        {/* Classes */}
        {aulas.map((aula) => {
          if (!days.includes(aula.diaSemana)) return null;

          const start = parseTime(aula.horarioInicio);
          const end = parseTime(aula.horarioFim);
          const duration = end - start;
          const top = (start - 7) * 60;
          const height = duration * 60;
          const dayIndex = days.indexOf(aula.diaSemana);
          const left = 16.666 + dayIndex * 16.666;
          const courseColor = courseColors[aula.disciplina.curso.nome] || {
            text: "#1c1f21",
            bg: "#f0efea",
            border: "#dddbd3",
          };

          return (
            <div
              key={aula.id}
              className="absolute p-2 overflow-hidden rounded-md border-l-4"
              style={{
                top: `${top}px`,
                height: `${height}px`,
                left: `${left}%`,
                width: "16.666%",
                backgroundColor: courseColor.bg,
                borderColor: courseColor.border,
              }}
            >
              <div
                className="text-xs font-semibold mb-1 truncate"
                style={{ color: courseColor.text }}
              >
                {aula.disciplina.nome}
              </div>
              <div className="text-[10px] text-[#6f767b] truncate">
                {aula.ambiente.nome}
              </div>
              <div className="text-[10px] font-ibm-plex-mono text-[#8a9095] mt-1">
                {aula.horarioInicio} - {aula.horarioFim}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
