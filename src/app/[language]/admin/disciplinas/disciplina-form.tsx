"use client";

import { routes } from "@/routes";
import { useState } from "react";
import { FormShell } from "@/components/form-shell";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { applyApiFormErrors } from "@/services/api/apply-api-form-errors";
import { useGetCursosService } from "@/services/api/services/cursos";
import type { Disciplina } from "@/services/api/services/disciplinas";

const schema = yup.object().shape({
  nome: yup.string().required("O nome é obrigatório"),
  cursoId: yup.string().required("O curso é obrigatório"),
});

export type DisciplinaFormData = yup.InferType<typeof schema>;

type ApiResult =
  | {
      status: typeof HTTP_CODES_ENUM.OK | typeof HTTP_CODES_ENUM.CREATED;
      data: Disciplina;
    }
  | {
      status: number;
      data?: { errors?: Record<string, string>; message?: string };
    };

type DisciplinaFormProps = {
  /** `page` (padrão): tela própria. `drawer`: campos + rodapé dentro de um Sheet. */
  variant?: "page" | "drawer";
  /** Cancelar na variante `drawer`. */
  onCancel?: () => void;
  /** Chamado após salvar. Sem ele, volta para a lista. */
  onSuccess?: () => void;
  title: string;
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  defaultValues?: Partial<DisciplinaFormData>;
  onSave: (data: DisciplinaFormData) => Promise<ApiResult>;
};

export function DisciplinaForm({
  variant = "page",
  onCancel,
  onSuccess,
  title,
  submitLabel,
  submittingLabel,
  successMessage,
  defaultValues,
  onSave,
}: DisciplinaFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const getCursos = useGetCursosService();

  const { data: cursosRes, isLoading: isLoadingCursos } = useQuery({
    queryKey: ["cursos"],
    queryFn: () => getCursos(),
  });
  const cursos = cursosRes?.status === HTTP_CODES_ENUM.OK ? cursosRes.data : [];

  const form = useForm<DisciplinaFormData>({
    resolver: yupResolver(schema) as never,
    defaultValues: { nome: "", cursoId: "", ...defaultValues },
    values: defaultValues as DisciplinaFormData | undefined,
  });

  const onSubmit = async (data: DisciplinaFormData) => {
    setSubmitting(true);
    try {
      const res = await onSave(data);
      if (
        res.status === HTTP_CODES_ENUM.OK ||
        res.status === HTTP_CODES_ENUM.CREATED
      ) {
        toast.success(successMessage);
        if (onSuccess) onSuccess();
        else router.push(routes.disciplinas.admin.list());
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
    <FormShell
      variant={variant}
      title={title}
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      submitting={submitting}
      submitLabel={submitLabel}
      submittingLabel={submittingLabel}
      backHref={routes.disciplinas.admin.list()}
      backLabel="Voltar para disciplinas"
      onCancel={onCancel}
      width="max-w-[600px]"
    >
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome *</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Direito Constitucional I" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
    </FormShell>
  );
}
