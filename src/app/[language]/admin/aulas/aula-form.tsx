"use client";

import { routes } from "@/routes";
import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ConflictBanner } from "@/components/conflict-banner";
import { applyApiFormErrors } from "@/services/api/apply-api-form-errors";
import { useGetCursosService } from "@/services/api/services/cursos";
import { useGetDisciplinasService } from "@/services/api/services/disciplinas";
import { useGetTurmasService } from "@/services/api/services/turmas";
import { useGetAmbientesService } from "@/services/api/services/ambientes";
import { useGetUsersService } from "@/services/api/services/users";
import { RoleEnum } from "@/services/api/types/role";
import {
  DiaSemana,
  CreateAulaResponse,
  UpdateAulaResponse,
} from "@/services/api/services/aulas";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const timeOptions = Array.from({ length: 31 }, (_, i) => {
  const hours = Math.floor(i / 2) + 7;
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
});

const diasDaSemana: { value: DiaSemana; label: string }[] = [
  { value: "Segunda", label: "Segunda-feira" },
  { value: "Terça", label: "Terça-feira" },
  { value: "Quarta", label: "Quarta-feira" },
  { value: "Quinta", label: "Quinta-feira" },
  { value: "Sexta", label: "Sexta-feira" },
  { value: "Sábado", label: "Sábado" },
];

const schema = yup.object().shape({
  cursoId: yup.string().required("O curso é obrigatório"),
  disciplinaId: yup.string().required("A disciplina é obrigatória"),
  professorId: yup.string().required("O professor é obrigatório"),
  turmaId: yup.string().required("A turma é obrigatória"),
  diaSemana: yup.string().required("O dia da semana é obrigatório"),
  horarioInicio: yup.string().required("O horário de início é obrigatório"),
  horarioFim: yup.string().required("O horário de fim é obrigatório"),
  ambienteId: yup.string().required("O ambiente é obrigatório"),
});

export type AulaFormData = yup.InferType<typeof schema>;

type AulaFormProps = {
  title: string;
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  defaultValues?: Partial<AulaFormData>;
  onSave: (
    data: AulaFormData
  ) => Promise<CreateAulaResponse | UpdateAulaResponse>;
  onSaved: () => void;
};

export function AulaForm({
  title,
  submitLabel,
  submittingLabel,
  successMessage,
  defaultValues,
  onSave,
  onSaved,
}: AulaFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [conflictStatus, setConflictStatus] = useState<"conflict" | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string>("");

  const getCursos = useGetCursosService();
  const getDisciplinas = useGetDisciplinasService();
  const getTurmas = useGetTurmasService();
  const getAmbientes = useGetAmbientesService();
  const getUsers = useGetUsersService();

  const form = useForm<AulaFormData>({
    resolver: yupResolver(schema) as never,
    defaultValues: {
      cursoId: "",
      disciplinaId: "",
      professorId: "",
      turmaId: "",
      diaSemana: "",
      horarioInicio: "",
      horarioFim: "",
      ambienteId: "",
      ...defaultValues,
    },
    values: defaultValues as AulaFormData | undefined,
  });

  const cursoId = useWatch({ control: form.control, name: "cursoId" });
  const ambienteId = useWatch({ control: form.control, name: "ambienteId" });
  const diaSemana = useWatch({ control: form.control, name: "diaSemana" });
  const horarioInicio = useWatch({
    control: form.control,
    name: "horarioInicio",
  });
  const horarioFim = useWatch({ control: form.control, name: "horarioFim" });

  useEffect(() => {
    setConflictStatus(null);
  }, [ambienteId, diaSemana, horarioInicio, horarioFim]);

  const { data: cursosRes, isLoading: isLoadingCursos } = useQuery({
    queryKey: ["cursos"],
    queryFn: () => getCursos(),
  });
  const cursos = cursosRes?.status === HTTP_CODES_ENUM.OK ? cursosRes.data : [];

  const { data: disciplinasRes, isLoading: isLoadingDisciplinas } = useQuery({
    queryKey: ["disciplinas"],
    queryFn: () => getDisciplinas(),
  });
  const allDisciplinas =
    disciplinasRes?.status === HTTP_CODES_ENUM.OK
      ? disciplinasRes.data.data
      : [];
  const disciplinas = allDisciplinas.filter((d) => d.curso.id === cursoId);

  const { data: turmasRes, isLoading: isLoadingTurmas } = useQuery({
    queryKey: ["turmas"],
    queryFn: () => getTurmas(),
  });
  const allTurmas =
    turmasRes?.status === HTTP_CODES_ENUM.OK ? turmasRes.data.data : [];
  const turmas = allTurmas.filter((t) => t.curso.id === cursoId);

  const { data: ambientesRes, isLoading: isLoadingAmbientes } = useQuery({
    queryKey: ["ambientes"],
    queryFn: () => getAmbientes(),
  });
  const ambientes =
    ambientesRes?.status === HTTP_CODES_ENUM.OK ? ambientesRes.data.data : [];

  const { data: professoresRes, isLoading: isLoadingProfessores } = useQuery({
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

  const onSubmit = async (data: AulaFormData) => {
    setSubmitting(true);
    try {
      const res = await onSave(data);
      if (
        res.status === HTTP_CODES_ENUM.CREATED ||
        res.status === HTTP_CODES_ENUM.OK
      ) {
        toast.success(successMessage);
        onSaved();
        return;
      }
      if (res.status === HTTP_CODES_ENUM.CONFLICT) {
        setConflictStatus("conflict");
        setConflictMessage(res.data.message);
        toast.error(res.data.message);
        return;
      }
      applyApiFormErrors(res as never, form.setError);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível salvar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const withCurrentValue = (value: string | undefined) =>
    value && !timeOptions.includes(value)
      ? [value, ...timeOptions]
      : timeOptions;

  return (
    <div className="p-6 max-w-[700px] mx-auto w-full">
      <Link
        href={routes.aulas.admin.list()}
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para aulas
      </Link>

      <Card>
        <CardHeader className="border-b pb-6">
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="cursoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Curso *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoadingCursos}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione o curso" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cursos.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="disciplinaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disciplina *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!cursoId || isLoadingDisciplinas}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione a disciplina" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {disciplinas.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="professorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professor *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoadingProfessores}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione o professor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {professores.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.firstName} {p.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="turmaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Turma *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!cursoId || isLoadingTurmas}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione a turma" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {turmas.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.codigo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="diaSemana"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia da semana *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione o dia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {diasDaSemana.map((d) => (
                            <SelectItem key={d.value} value={d.value}>
                              {d.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ambienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ambiente *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoadingAmbientes}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione o ambiente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ambientes.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="horarioInicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full font-ibm-plex-mono">
                            <SelectValue placeholder="00:00" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {withCurrentValue(field.value).map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="horarioFim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fim *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full font-ibm-plex-mono">
                            <SelectValue placeholder="00:00" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {withCurrentValue(field.value).map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {conflictStatus === "conflict" && (
                <ConflictBanner status="conflict" message={conflictMessage} />
              )}
            </CardContent>

            <CardFooter className="border-t bg-surface-3 py-6 flex justify-end gap-3 rounded-b-xl">
              <Link href={routes.aulas.admin.list()}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={submitting || conflictStatus === "conflict"}
              >
                {submitting ? submittingLabel : submitLabel}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
