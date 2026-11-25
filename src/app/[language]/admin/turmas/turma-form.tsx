"use client";

import { routes } from "@/routes";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { useGetCursosService } from "@/services/api/services/cursos";
import type { Turma } from "@/services/api/services/turmas";

const schema = yup.object().shape({
  codigo: yup.string().required("O código é obrigatório"),
  periodo: yup.string().required("O período é obrigatório"),
  cursoId: yup.string().required("O curso é obrigatório"),
});

export type TurmaFormData = yup.InferType<typeof schema>;

type ApiResult =
  | {
      status: typeof HTTP_CODES_ENUM.OK | typeof HTTP_CODES_ENUM.CREATED;
      data: Turma;
    }
  | {
      status: number;
      data?: { errors?: Record<string, string>; message?: string };
    };

type TurmaFormProps = {
  title: string;
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  defaultValues?: Partial<TurmaFormData>;
  onSave: (data: TurmaFormData) => Promise<ApiResult>;
};

export function TurmaForm({
  title,
  submitLabel,
  submittingLabel,
  successMessage,
  defaultValues,
  onSave,
}: TurmaFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const getCursos = useGetCursosService();

  const { data: cursosRes, isLoading: isLoadingCursos } = useQuery({
    queryKey: ["cursos"],
    queryFn: () => getCursos(),
  });
  const cursos = cursosRes?.status === HTTP_CODES_ENUM.OK ? cursosRes.data : [];

  const form = useForm<TurmaFormData>({
    resolver: yupResolver(schema) as never,
    defaultValues: { codigo: "", periodo: "", cursoId: "", ...defaultValues },
    values: defaultValues as TurmaFormData | undefined,
  });

  const onSubmit = async (data: TurmaFormData) => {
    setSubmitting(true);
    try {
      const res = await onSave(data);
      if (
        res.status === HTTP_CODES_ENUM.OK ||
        res.status === HTTP_CODES_ENUM.CREATED
      ) {
        toast.success(successMessage);
        router.push(routes.turmas.admin.list());
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
    <div className="p-6 max-w-[600px] mx-auto w-full">
      <Link
        href={routes.turmas.admin.list()}
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para turmas
      </Link>

      <Card>
        <CardHeader className="border-b pb-6">
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 pt-6">
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
                          <SelectValue
                            placeholder={
                              isLoadingCursos
                                ? "Carregando cursos..."
                                : "Selecione o curso"
                            }
                          />
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
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 201N2A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="periodo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Período *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2º" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="border-t bg-surface-3 py-6 flex justify-end gap-3 rounded-b-xl">
              <Link href={routes.turmas.admin.list()}>
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
