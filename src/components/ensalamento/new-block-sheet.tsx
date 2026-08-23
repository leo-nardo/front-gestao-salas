"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetCursosService } from "@/services/api/services/cursos";
import { useGetDisciplinasService } from "@/services/api/services/disciplinas";
import { useGetTurmasService } from "@/services/api/services/turmas";
import { useGetAmbientesService } from "@/services/api/services/ambientes";
import { useGetUsersService } from "@/services/api/services/users";
import { RoleEnum } from "@/services/api/types/role";
import { useCreateAulaService, DiaSemana } from "@/services/api/services/aulas";
import { useCreateReservaService } from "@/services/api/services/reservas";
import useAuth from "@/services/auth/use-auth";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { currentWeekDates, DIAS_SEMANA } from "./types";
import { format } from "date-fns";

const TIME_OPTIONS = Array.from({ length: 31 }, (_, i) => {
  const hours = Math.floor(i / 2) + 7;
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
});

type NewBlockSheetProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  ambienteId: string;
  diaSemana: DiaSemana;
  horarioInicio: string;
  /** Absolute date the slot was clicked on (calendar views). When present,
   * overrides the "current week" default used for the reserva date field. */
  date?: Date;
};

export function NewBlockSheet({
  open,
  onClose,
  onCreated,
  ambienteId,
  diaSemana,
  horarioInicio,
  date,
}: NewBlockSheetProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [tipo, setTipo] = useState<"aula" | "reserva">("aula");

  const [cursoId, setCursoId] = useState("");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [dia, setDia] = useState<DiaSemana>(diaSemana);
  const [amb, setAmb] = useState(ambienteId);
  const [inicio, setInicio] = useState(horarioInicio);
  const [fim, setFim] = useState("");

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [reservaData, setReservaData] = useState("");

  const [conflictMsg, setConflictMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTipo("aula");
    setCursoId("");
    setDisciplinaId("");
    setTurmaId("");
    setProfessorId("");
    setDia(diaSemana);
    setAmb(ambienteId);
    setInicio(horarioInicio);
    const startHour = parseInt(horarioInicio.split(":")[0], 10);
    setFim(`${String(Math.min(startHour + 3, 22)).padStart(2, "0")}:00`);
    setTitulo("");
    setDescricao("");
    setReservaData(
      date ? format(date, "yyyy-MM-dd") : currentWeekDates()[diaSemana]
    );
    setConflictMsg(null);
  }, [open, ambienteId, diaSemana, horarioInicio, date]);

  const getCursos = useGetCursosService();
  const { data: cursosRes } = useQuery({
    queryKey: ["cursos"],
    queryFn: () => getCursos(),
    enabled: open,
  });
  const cursos = cursosRes?.status === HTTP_CODES_ENUM.OK ? cursosRes.data : [];

  const getDisciplinas = useGetDisciplinasService();
  const { data: disciplinasRes } = useQuery({
    queryKey: ["disciplinas"],
    queryFn: () => getDisciplinas(),
    enabled: open,
  });
  const disciplinas = useMemo(() => {
    const all =
      disciplinasRes?.status === HTTP_CODES_ENUM.OK
        ? disciplinasRes.data.data
        : [];
    return all.filter((d) => d.curso.id === cursoId);
  }, [disciplinasRes, cursoId]);

  const getTurmas = useGetTurmasService();
  const { data: turmasRes } = useQuery({
    queryKey: ["turmas"],
    queryFn: () => getTurmas(),
    enabled: open,
  });
  const turmas = useMemo(() => {
    const all =
      turmasRes?.status === HTTP_CODES_ENUM.OK ? turmasRes.data.data : [];
    return all.filter((t) => t.curso.id === cursoId);
  }, [turmasRes, cursoId]);

  const getAmbientes = useGetAmbientesService();
  const { data: ambientesRes } = useQuery({
    queryKey: ["ambientes", { limit: "500" }],
    queryFn: () => getAmbientes({ limit: "500" }),
    enabled: open,
  });
  const ambientes =
    ambientesRes?.status === HTTP_CODES_ENUM.OK ? ambientesRes.data.data : [];

  const getUsers = useGetUsersService();
  const { data: professoresRes } = useQuery({
    queryKey: ["professores"],
    queryFn: () =>
      getUsers({
        page: 1,
        limit: 50,
        filters: { roles: [{ id: RoleEnum.PROFESSOR }] },
      }),
    enabled: open,
  });
  const professores =
    professoresRes?.status === HTTP_CODES_ENUM.OK
      ? professoresRes.data.data
      : [];

  const createAula = useCreateAulaService();
  const createReserva = useCreateReservaService();

  const createMutation = useMutation({
    mutationFn: async () => {
      if (tipo === "aula") {
        return createAula({
          turma: { id: turmaId },
          disciplina: { id: disciplinaId },
          professor: { id: professorId },
          ambiente: { id: amb },
          diaSemana: dia,
          horarioInicio: inicio,
          horarioFim: fim,
        });
      }
      return createReserva({
        ambiente: { id: amb },
        solicitante: { id: String(user?.id ?? "") },
        data: reservaData,
        horarioInicio: inicio,
        horarioFim: fim,
        titulo,
        descricao: descricao || undefined,
      });
    },
    onSuccess: (res) => {
      if (res.status === HTTP_CODES_ENUM.CONFLICT) {
        setConflictMsg(res.data.message);
        return;
      }
      if (res.status !== HTTP_CODES_ENUM.CREATED) {
        toast.error("Erro ao salvar. Confira os campos e tente novamente.");
        return;
      }
      toast.success(
        tipo === "aula"
          ? "Aula criada com sucesso!"
          : "Reserva criada com sucesso!"
      );
      queryClient.invalidateQueries({ queryKey: ["aulas"] });
      queryClient.invalidateQueries({ queryKey: ["reservas"] });
      onCreated();
    },
    onError: () => toast.error("Erro ao salvar. Tente novamente."),
  });

  const isValid =
    tipo === "aula"
      ? !!(
          cursoId &&
          disciplinaId &&
          turmaId &&
          professorId &&
          dia &&
          inicio &&
          fim &&
          amb
        )
      : !!(titulo && reservaData && inicio && fim && amb);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-[420px] sm:max-w-[420px] p-0 gap-0"
      >
        <SheetHeader className="p-5 border-b border-secondary">
          <SheetTitle>Reservar horário</SheetTitle>
          <SheetDescription>
            {ambientes.find((a) => a.id === amb)?.nome} · {dia} · {inicio}
          </SheetDescription>
        </SheetHeader>

        <div className="p-5 pb-3">
          <div className="flex bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setTipo("aula")}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                tipo === "aula"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground/70"
              }`}
            >
              Aula fixa
            </button>
            <button
              onClick={() => setTipo("reserva")}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                tipo === "reserva"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground/70"
              }`}
            >
              Reserva avulsa
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
          {tipo === "aula" ? (
            <>
              <div className="space-y-2">
                <Label>Curso</Label>
                <Select value={cursoId} onValueChange={setCursoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {cursos.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Disciplina</Label>
                <Select
                  value={disciplinaId}
                  onValueChange={setDisciplinaId}
                  disabled={!cursoId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplinas.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Turma</Label>
                  <Select
                    value={turmaId}
                    onValueChange={setTurmaId}
                    disabled={!cursoId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {turmas.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.codigo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Professor</Label>
                  <Select value={professorId} onValueChange={setProfessorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {professores.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.firstName} {p.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Dia da semana</Label>
                <Select
                  value={dia}
                  onValueChange={(v) => setDia(v as DiaSemana)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIAS_SEMANA.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Reunião de colegiado"
                />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={reservaData}
                  onChange={(e) => setReservaData(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Input
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Ambiente</Label>
            <Select value={amb} onValueChange={setAmb}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ambiente" />
              </SelectTrigger>
              <SelectContent>
                {ambientes.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Início</Label>
              <Select value={inicio} onValueChange={setInicio}>
                <SelectTrigger className="font-ibm-plex-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fim</Label>
              <Select value={fim} onValueChange={setFim}>
                <SelectTrigger className="font-ibm-plex-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {conflictMsg && (
            <div className="p-3 rounded-lg bg-destructive-bg border border-destructive/30 text-sm text-destructive">
              {conflictMsg}
            </div>
          )}
        </div>

        <SheetFooter className="p-4 border-t bg-surface-3 flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            className="flex-1"
            disabled={!isValid || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
