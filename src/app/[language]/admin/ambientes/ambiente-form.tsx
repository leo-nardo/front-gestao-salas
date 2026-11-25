"use client";

import { routes } from "@/routes";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Link from "@/components/link";
import { Input } from "@/components/ui/input";
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
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { applyApiFormErrors } from "@/services/api/apply-api-form-errors";
import { useGetUnidadesService } from "@/services/api/services/unidades";
import { useGetTipoAmbientesService } from "@/services/api/services/tipo-ambientes";
import { useGetBlocosService } from "@/services/api/services/blocos";
import { useGetAndaresService } from "@/services/api/services/andares";
import type { Ambiente } from "@/services/api/services/ambientes";

const schema = yup.object().shape({
  nome: yup.string().required("O nome é obrigatório"),
  tipoAmbienteId: yup.string().required("O tipo de ambiente é obrigatório"),
  tipo: yup.string().required("A disponibilidade é obrigatória"),
  capacidade: yup
    .number()
    .typeError("Deve ser um número")
    .positive("Deve ser maior que zero")
    .required("A capacidade é obrigatória"),
  unidadeId: yup.string().required("A unidade é obrigatória"),
  blocoId: yup.string().optional(),
  andarId: yup.string().optional(),
  estacoesTrabalho: yup.number().optional().nullable(),
});

export type AmbienteFormData = yup.InferType<typeof schema>;

type ApiResult =
  | {
      status: typeof HTTP_CODES_ENUM.OK | typeof HTTP_CODES_ENUM.CREATED;
      data: Ambiente;
    }
  | {
      status: number;
      data?: { errors?: Record<string, string>; message?: string };
    };

type AmbienteFormProps = {
  title: string;
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  defaultValues?: Partial<AmbienteFormData>;
  onSave: (data: AmbienteFormData) => Promise<ApiResult>;
};

export function AmbienteForm({
  title,
  submitLabel,
  submittingLabel,
  successMessage,
  defaultValues,
  onSave,
}: AmbienteFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const getUnidades = useGetUnidadesService();
  const getTipoAmbientes = useGetTipoAmbientesService();
  const getBlocos = useGetBlocosService();
  const getAndares = useGetAndaresService();

  const { data: unidadesRes } = useQuery({
    queryKey: ["unidades"],
    queryFn: () => getUnidades(),
  });
  const { data: tiposRes } = useQuery({
    queryKey: ["tipos-ambiente", { limit: 500 }],
    queryFn: () => getTipoAmbientes({ limit: "500" }),
  });
  const { data: blocosRes } = useQuery({
    queryKey: ["blocos", { limit: 500 }],
    queryFn: () => getBlocos({ limit: "500" }),
  });
  const { data: andaresRes } = useQuery({
    queryKey: ["andares", { limit: 500 }],
    queryFn: () => getAndares({ limit: "500" }),
  });

  const unidades =
    unidadesRes?.status === HTTP_CODES_ENUM.OK ? unidadesRes.data.data : [];
  const tipoAmbientes =
    tiposRes?.status === HTTP_CODES_ENUM.OK ? tiposRes.data.data : [];
  const blocos =
    blocosRes?.status === HTTP_CODES_ENUM.OK ? blocosRes.data.data : [];
  const andares =
    andaresRes?.status === HTTP_CODES_ENUM.OK ? andaresRes.data.data : [];

  const form = useForm<AmbienteFormData>({
    resolver: yupResolver(schema) as never,
    defaultValues: {
      nome: "",
      tipo: "Grade fixa",
      blocoId: "none",
      andarId: "none",
      ...defaultValues,
    },
    values: defaultValues as AmbienteFormData | undefined,
  });

  const tipoAmbienteId = useWatch({
    control: form.control,
    name: "tipoAmbienteId",
  });
  const tipoAmbienteSelecionado = tipoAmbientes.find(
    (t) => t.id === tipoAmbienteId
  );

  const onSubmit = async (data: AmbienteFormData) => {
    setSubmitting(true);
    try {
      const res = await onSave(data);
      if (
        res.status === HTTP_CODES_ENUM.OK ||
        res.status === HTTP_CODES_ENUM.CREATED
      ) {
        toast.success(successMessage);
        router.push(routes.ambientes.admin.list());
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

  return (
    <div className="p-6 max-w-[800px] mx-auto w-full">
      <Link
        href={routes.ambientes.admin.list()}
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para ambientes
      </Link>

      <Card>
        <CardHeader className="border-b pb-6">
          <CardTitle className="text-xl">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Preencha os dados abaixo. Os campos com asterisco (*) são
            obrigatórios.
          </p>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome / identificação *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Sala 302" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipoAmbienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de ambiente *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tipoAmbientes.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id}>
                              {tipo.nome}
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
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disponibilidade *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Grade fixa">
                            Uso fixo semanal (grade)
                          </SelectItem>
                          <SelectItem value="Reservável">
                            Reservável sob demanda
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidade *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unidadeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade / campus *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {unidades.map((un) => (
                            <SelectItem key={un.id} value={un.id}>
                              {un.nome}
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
                  name="blocoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bloco</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione o bloco" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {blocos.map((bloco) => (
                            <SelectItem key={bloco.id} value={bloco.id}>
                              {bloco.nome}
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
                  name="andarId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Andar</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione o andar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {andares.map((andar) => (
                            <SelectItem key={andar.id} value={andar.id}>
                              {andar.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {tipoAmbienteSelecionado?.nome.includes("Laboratório") && (
                  <FormField
                    control={form.control}
                    name="estacoesTrabalho"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estações de trabalho</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>

            <CardFooter className="border-t bg-surface-3 py-6 flex justify-end gap-3 rounded-b-xl">
              <Link href={routes.ambientes.admin.list()}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={submitting}>
                {submitting ? submittingLabel : submitLabel}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
