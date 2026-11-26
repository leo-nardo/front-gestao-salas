"use client";

import { routes } from "@/routes";
import { useState } from "react";
import { FormShell } from "@/components/form-shell";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { applyApiFormErrors } from "@/services/api/apply-api-form-errors";
import type { Curso } from "@/services/api/services/cursos";

const schema = yup.object().shape({
  nome: yup.string().required("O nome é obrigatório"),
});

export type CursoFormData = yup.InferType<typeof schema>;

type ApiResult =
  | {
      status: typeof HTTP_CODES_ENUM.OK | typeof HTTP_CODES_ENUM.CREATED;
      data: Curso;
    }
  | {
      status: number;
      data?: { errors?: Record<string, string>; message?: string };
    };

type CursoFormProps = {
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
  defaultValues?: Partial<CursoFormData>;
  onSave: (data: CursoFormData) => Promise<ApiResult>;
};

export function CursoForm({
  variant = "page",
  onCancel,
  onSuccess,
  title,
  submitLabel,
  submittingLabel,
  successMessage,
  defaultValues,
  onSave,
}: CursoFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CursoFormData>({
    resolver: yupResolver(schema) as never,
    defaultValues: { nome: "", ...defaultValues },
    values: defaultValues as CursoFormData | undefined,
  });

  const onSubmit = async (data: CursoFormData) => {
    setSubmitting(true);
    try {
      const res = await onSave(data);
      if (
        res.status === HTTP_CODES_ENUM.OK ||
        res.status === HTTP_CODES_ENUM.CREATED
      ) {
        toast.success(successMessage);
        if (onSuccess) onSuccess();
        else router.push(routes.cursos.admin.list());
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
      backHref={routes.cursos.admin.list()}
      backLabel="Voltar para Cursos"
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
              <Input placeholder="Ex: Engenharia de Software" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormShell>
  );
}
