"use client";

import React, { useState, useEffect } from "react";
import Link from "@/components/link";
import { useRouter } from "next/navigation";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { useForm, useFormState, useWatch, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useGetCursosService } from "@/services/api/services/cursos";
import { useGetDisciplinasService } from "@/services/api/services/disciplinas";
import { useGetTurmasService } from "@/services/api/services/turmas";
import { useGetAmbientesService } from "@/services/api/services/ambientes";
import { useGetUsersService } from "@/services/api/services/users";
import { RoleEnum } from "@/services/api/types/role";
import {
  useGetAulaService,
  useUpdateAulaService,
  DiaSemana,
} from "@/services/api/services/aulas";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ConflictBanner } from "@/components/conflict-banner";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const schema = yup.object().shape({
  cursoId: yup.string().required("Curso é obrigatório"),
  disciplinaId: yup.string().required("Disciplina é obrigatória"),
  professorId: yup.string().required("Professor é obrigatório"),
  turmaId: yup.string().required("Turma é obrigatória"),
  diaSemana: yup.string().required("Dia da semana é obrigatório"),
  horarioInicio: yup.string().required("Horário de início é obrigatório"),
  horarioFim: yup.string().required("Horário de fim é obrigatório"),
  ambienteId: yup.string().required("Ambiente é obrigatório"),
});

type FormData = yup.InferType<typeof schema>;

const timeOptions = Array.from({ length: 31 }, (_, i) => {
  const hours = Math.floor(i / 2) + 7;
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
});

const diasDaSemana = [
  { value: "Segunda", label: "Segunda-feira" },
  { value: "Terça", label: "Terça-feira" },
  { value: "Quarta", label: "Quarta-feira" },
  { value: "Quinta", label: "Quinta-feira" },
  { value: "Sexta", label: "Sexta-feira" },
  { value: "Sábado", label: "Sábado" },
];

export default function EditAulaPageContent({
  id,
  language,
}: {
  id: string;
  language: string;
}) {
  const router = useRouter();

  const [conflictStatus, setConflictStatus] = useState<
    "checking" | "available" | "conflict" | null
  >(null);
  const [conflictMessage, setConflictMessage] = useState<string>("");

  const getAula = useGetAulaService();
  const getCursos = useGetCursosService();
  const getDisciplinas = useGetDisciplinasService();
  const getTurmas = useGetTurmasService();
  const getAmbientes = useGetAmbientesService();
  const getUsers = useGetUsersService();
  const updateAula = useUpdateAulaService();

  const { data: aulaRes, isLoading: isAulaLoading } = useQuery({
    queryKey: ["aula", id],
    queryFn: () => getAula(id),
  });

  const { control, handleSubmit, reset, trigger } = useForm<FormData>({
    resolver: yupResolver(schema) as never,
  });

  const { errors, isValid } = useFormState({ control });
  const watchAllFields = useWatch({ control });

  const { data: cursosRes, isLoading: isCursosLoading } = useQuery({
    queryKey: ["cursos"],
    queryFn: () => getCursos(),
  });
  const cursos = cursosRes?.status === HTTP_CODES_ENUM.OK ? cursosRes.data : [];

  const { data: disciplinasRes, isLoading: isDisciplinasLoading } = useQuery({
    queryKey: ["disciplinas"],
    queryFn: () => getDisciplinas(),
  });
  const allDisciplinas =
    disciplinasRes?.status === HTTP_CODES_ENUM.OK
      ? disciplinasRes.data.data
      : [];
  const disciplinas = allDisciplinas.filter(
    (d) => d.curso.id === watchAllFields.cursoId
  );

  const { data: turmasRes, isLoading: isTurmasLoading } = useQuery({
    queryKey: ["turmas"],
    queryFn: () => getTurmas(),
  });
  const allTurmas =
    turmasRes?.status === HTTP_CODES_ENUM.OK ? turmasRes.data.data : [];
  const turmas = allTurmas.filter((t) => t.curso.id === watchAllFields.cursoId);

  const { data: ambientesRes, isLoading: isAmbientesLoading } = useQuery({
    queryKey: ["ambientes"],
    queryFn: () => getAmbientes(),
  });
  const ambientes =
    ambientesRes?.status === HTTP_CODES_ENUM.OK ? ambientesRes.data.data : [];

  const { data: professoresRes, isLoading: isProfessoresLoading } = useQuery({
    queryKey: ["professores"],
    queryFn: () =>
      getUsers({
        page: 1,
        limit: 50,
        filters: { roles: [{ id: RoleEnum.PROFESSOR }] },
      }),
  });
  const professores =
    professoresRes?.status === HTTP_CODES_ENUM.OK
      ? professoresRes.data.data
      : [];

  const isLoading =
    isAulaLoading ||
    isCursosLoading ||
    isDisciplinasLoading ||
    isTurmasLoading ||
    isAmbientesLoading ||
    isProfessoresLoading;

  useEffect(() => {
    if (aulaRes?.status === HTTP_CODES_ENUM.OK && aulaRes.data) {
      const aula = aulaRes.data;
      reset({
        cursoId: aula.disciplina?.curso?.id || "",
        disciplinaId: aula.disciplina?.id || "",
        professorId: String(aula.professor?.id || ""),
        turmaId: aula.turma?.id || "",
        diaSemana: (aula.diaSemana || "") as DiaSemana,
        horarioInicio: aula.horarioInicio || "",
        horarioFim: aula.horarioFim || "",
        ambienteId: aula.ambiente?.id || "",
      });
      trigger();
    }
  }, [aulaRes, reset, trigger]);

  useEffect(() => {
    setConflictStatus(null);
  }, [
    watchAllFields.ambienteId,
    watchAllFields.diaSemana,
    watchAllFields.horarioInicio,
    watchAllFields.horarioFim,
  ]);

  const updateMutation = useMutation({
    mutationFn: (data: FormData) =>
      updateAula(id, {
        turma: { id: data.turmaId },
        disciplina: { id: data.disciplinaId },
        professor: { id: data.professorId },
        ambiente: { id: data.ambienteId },
        diaSemana: data.diaSemana as DiaSemana,
        horarioInicio: data.horarioInicio,
        horarioFim: data.horarioFim,
      }),
    onSuccess: (res) => {
      if (res.status === HTTP_CODES_ENUM.CONFLICT) {
        setConflictStatus("conflict");
        setConflictMessage(res.data.message);
        toast.error(res.data.message);
        return;
      }
      if (res.status !== HTTP_CODES_ENUM.OK) {
        toast.error("Erro ao atualizar a aula. Tente novamente.");
        return;
      }
      toast.success("Aula atualizada com sucesso!");
      router.push(`/${language}/admin/aulas`);
    },
    onError: () => {
      toast.error("Erro ao atualizar a aula. Tente novamente.");
    },
  });

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/admin/aulas"
          className="inline-flex items-center text-sm font-medium text-[#6f767b] hover:text-[#1a4f8a] mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para aulas
        </Link>
        <h1 className="text-2xl font-bold text-[#1c1f21] font-public-sans">
          Editar aula
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-[#e6e5e0] p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Curso</Label>
              <Controller
                name="cursoId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="border-[#dddbd3] bg-[#fbfaf7]">
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
                )}
              />
              {errors.cursoId && (
                <span className="text-xs text-red-500">
                  {errors.cursoId.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label>Disciplina</Label>
              <Controller
                name="disciplinaId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!watchAllFields.cursoId}
                  >
                    <SelectTrigger className="border-[#dddbd3] bg-[#fbfaf7]">
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
                )}
              />
              {errors.disciplinaId && (
                <span className="text-xs text-red-500">
                  {errors.disciplinaId.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label>Professor</Label>
              <Controller
                name="professorId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="border-[#dddbd3] bg-[#fbfaf7]">
                      <SelectValue placeholder="Selecione o professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {professores.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.firstName} {p.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.professorId && (
                <span className="text-xs text-red-500">
                  {errors.professorId.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label>Turma</Label>
              <Controller
                name="turmaId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!watchAllFields.cursoId}
                  >
                    <SelectTrigger className="border-[#dddbd3] bg-[#fbfaf7]">
                      <SelectValue placeholder="Selecione a turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {turmas.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.codigo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.turmaId && (
                <span className="text-xs text-red-500">
                  {errors.turmaId.message}
                </span>
              )}
            </div>
          </div>

          <hr className="border-[#e6e5e0]" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Dia da semana</Label>
              <Controller
                name="diaSemana"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="border-[#dddbd3] bg-[#fbfaf7]">
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {diasDaSemana.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.diaSemana && (
                <span className="text-xs text-red-500">
                  {errors.diaSemana.message}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Horário início</Label>
                <Controller
                  name="horarioInicio"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="border-[#dddbd3] bg-[#fbfaf7] font-ibm-plex-mono">
                        <SelectValue placeholder="00:00" />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.value && !timeOptions.includes(field.value)
                          ? [field.value, ...timeOptions]
                          : timeOptions
                        ).map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.horarioInicio && (
                  <span className="text-xs text-red-500">
                    {errors.horarioInicio.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label>Horário fim</Label>
                <Controller
                  name="horarioFim"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="border-[#dddbd3] bg-[#fbfaf7] font-ibm-plex-mono">
                        <SelectValue placeholder="00:00" />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.value && !timeOptions.includes(field.value)
                          ? [field.value, ...timeOptions]
                          : timeOptions
                        ).map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.horarioFim && (
                  <span className="text-xs text-red-500">
                    {errors.horarioFim.message}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Ambiente</Label>
              <Controller
                name="ambienteId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="border-[#dddbd3] bg-[#fbfaf7]">
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
                )}
              />
              {errors.ambienteId && (
                <span className="text-xs text-red-500">
                  {errors.ambienteId.message}
                </span>
              )}
            </div>
          </div>

          {conflictStatus && (
            <div className="pt-2">
              <ConflictBanner
                status={conflictStatus}
                message={conflictMessage}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#e6e5e0]">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/${language}/admin/aulas`)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white"
              disabled={
                !isValid ||
                conflictStatus === "conflict" ||
                updateMutation.isPending
              }
            >
              {updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
