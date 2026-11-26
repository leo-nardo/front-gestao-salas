"use client";

import { useState } from "react";
import { FormShell } from "@/components/form-shell";
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
import { useGetAmbientesService } from "@/services/api/services/ambientes";
import type { ItemPatrimonial } from "@/services/api/services/item-patrimonials";

const schema = yup.object().shape({
  nome: yup.string().required("O nome é obrigatório"),
  tipo: yup.string().required("O tipo é obrigatório"),
  ambienteId: yup.string().required("O ambiente é obrigatório"),
  numeroPatrimonio: yup.string().optional(),
  estado: yup.string().required("O estado é obrigatório"),
});

export type PatrimonioFormData = yup.InferType<typeof schema>;

type ApiResult =
  | {
      status: typeof HTTP_CODES_ENUM.OK | typeof HTTP_CODES_ENUM.CREATED;
      data: ItemPatrimonial;
    }
  | {
      status: number;
      data?: { errors?: Record<string, string>; message?: string };
    };

type PatrimonioFormProps = {
  /** `page` (padrão): tela própria. `drawer`: campos + rodapé dentro de um Sheet. */
  variant?: "page" | "drawer";
  /** Cancelar na variante `drawer`. */
  onCancel?: () => void;
  title: string;
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  backHref: string;
  defaultValues?: Partial<PatrimonioFormData>;
  onSave: (data: PatrimonioFormData) => Promise<ApiResult>;
  onSaved: () => void;
};

export function PatrimonioForm({
  variant = "page",
  onCancel,
  title,
  submitLabel,
  submittingLabel,
  successMessage,
  backHref,
  defaultValues,
  onSave,
  onSaved,
}: PatrimonioFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const getAmbientes = useGetAmbientesService();

  const { data: ambientesRes, isLoading: isLoadingAmbientes } = useQuery({
    queryKey: ["ambientes", { limit: "500" }],
    queryFn: () => getAmbientes({ limit: "500" }),
  });
  const ambientes =
    ambientesRes?.status === HTTP_CODES_ENUM.OK ? ambientesRes.data.data : [];

  const form = useForm<PatrimonioFormData>({
    resolver: yupResolver(schema) as never,
    defaultValues: {
      nome: "",
      tipo: "",
      ambienteId: "",
      numeroPatrimonio: "",
      estado: "funcionando",
      ...defaultValues,
    },
    values: defaultValues as PatrimonioFormData | undefined,
  });

  const onSubmit = async (data: PatrimonioFormData) => {
    setSubmitting(true);
    try {
      const res = await onSave(data);
      if (
        res.status === HTTP_CODES_ENUM.OK ||
        res.status === HTTP_CODES_ENUM.CREATED
      ) {
        toast.success(successMessage);
        onSaved();
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
      backHref={backHref}
      backLabel="Voltar para patrimônio"
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
              <Input placeholder="Ex: Projetor Epson" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tipo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo *</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Projetor, Ar Condicionado" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="numeroPatrimonio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Patrimônio</FormLabel>
            <FormControl>
              <Input placeholder="Opcional" {...field} />
            </FormControl>
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
                {ambientes.map((amb) => (
                  <SelectItem key={amb.id} value={amb.id}>
                    {amb.nome}
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
        name="estado"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="funcionando">Funcionando</SelectItem>
                <SelectItem value="com_defeito">Com defeito</SelectItem>
                <SelectItem value="em_manutencao">Em manutenção</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormShell>
  );
}
