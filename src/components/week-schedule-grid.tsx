import { Aula, DiaSemana } from "@/services/api/services/aulas";
import { getCursoColors } from "@/lib/curso-colors";

const diasSemana: DiaSemana[] = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
];

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
    <div className="bg-card rounded-xl border overflow-hidden shadow-sm">
      <div className="grid grid-cols-6 border-b bg-surface-3">
        <div className="p-3 text-center border-r text-sm font-semibold text-muted-foreground">
          Horário
        </div>
        {days.map((day) => (
          <div
            key={day}
            className="p-3 text-center border-r last:border-r-0 text-sm font-semibold text-foreground"
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
            className="absolute w-full border-t border-secondary flex"
            style={{ top: `${i * 60}px`, height: "60px" }}
          >
            <div className="w-[16.666%] border-r flex items-start justify-center pt-2">
              <span className="text-xs font-ibm-plex-mono text-muted-foreground">
                {hour.toString().padStart(2, "0")}:00
              </span>
            </div>
            {days.map((day) => (
              <div
                key={day}
                className="w-[16.666%] border-r last:border-r-0 border-secondary"
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
          const courseColor = getCursoColors(aula.disciplina.curso.nome);

          return (
            <div
              key={aula.id}
              className="absolute p-2 overflow-hidden rounded-md border-l-4"
              title={`${aula.disciplina.nome} (${aula.disciplina.curso.nome}) - ${aula.ambiente.nome}${aula.turma?.codigo ? ` - Turma ${aula.turma.codigo}` : ""} (${aula.horarioInicio} - ${aula.horarioFim})`}
              style={{
                top: `${top}px`,
                height: `${height}px`,
                left: `${left}%`,
                width: "16.666%",
                backgroundColor: courseColor.bg,
                borderColor: courseColor.text,
              }}
            >
              <div
                className="text-xs font-semibold mb-1 truncate"
                style={{ color: courseColor.text }}
              >
                {aula.disciplina.nome}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {aula.ambiente.nome}
                {aula.turma?.codigo ? ` • ${aula.turma.codigo}` : ""}
              </div>
              <div className="text-[10px] font-ibm-plex-mono text-muted-foreground/80 mt-1">
                {aula.horarioInicio} - {aula.horarioFim}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
