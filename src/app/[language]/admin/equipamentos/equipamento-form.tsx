"use client";

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
import { useGetUnidadesService } from "@/services/api/services/unidades";
import type { Equipamento } from "@/services/api/services/equipamentos";

const schema = yup.object().shape({
  nome: yup.string().required("O nome é obrigatório"),
  tipo: yup.string().required("O tipo é obrigatório"),
  unidadeId: yup.string().required("A unidade é obrigatória"),
  quantidadeTotal: yup
    .number()
    .typeError("Deve ser um número")
    .positive("Deve ser maior que zero")
    .required("A quantidade total é obrigatória"),
  descricao: yup.string().optional(),
});

export type EquipamentoFormData = yup.InferType<typeof schema>;

type ApiResult =
  | {
      status: typeof HTTP_CODES_ENUM.OK | typeof HTTP_CODES_ENUM.CREATED;
      data: Equipamento;
    }
  | {
      status: number;
      data?: { errors?: Record<string, string>; message?: string };
    };

type EquipamentoFormProps = {
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
  defaultValues?: Partial<EquipamentoFormData>;
  onSave: (data: EquipamentoFormData) => Promise<ApiResult>;
};

export function EquipamentoForm({
  variant = "page",
  onCancel,
  onSuccess,
  title,
  submitLabel,
  submittingLabel,
  successMessage,
  defaultValues,
  onSave,
}: EquipamentoFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const getUnidades = useGetUnidadesService();

  const { data: unidadesRes, isLoading: isLoadingUnidades } = useQuery({
    queryKey: ["unidades", { limit: "500" }],
    queryFn: () => getUnidades({ limit: "500" }),
  });
  const unidades =
    unidadesRes?.status === HTTP_CODES_ENUM.OK ? unidadesRes.data.data : [];

  const form = useForm<EquipamentoFormData>({
    resolver: yupResolver(schema) as never,
    defaultValues: {
      nome: "",
      tipo: "",
      unidadeId: "",
      descricao: "",
      ...defaultValues,
    },
    values: defaultValues as EquipamentoFormData | undefined,
  });

  const onSubmit = async (data: EquipamentoFormData) => {
    setSubmitting(true);
    try {
      const res = await onSave(data);
      if (
        res.status === HTTP_CODES_ENUM.OK ||
        res.status === HTTP_CODES_ENUM.CREATED
      ) {
        toast.success(successMessage);
        if (onSuccess) onSuccess();
        else router.push("/admin/equipamentos");
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
      backHref="/admin/equipamentos"
      backLabel="Voltar para equipamentos"
      onCancel={onCancel}
      width="max-w-[700px]"
    >
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome *</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Projetor portátil EPSON" {...field} />
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
              <Input
                placeholder="Ex: Projetor, Caixa de som, Notebook"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="unidadeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidade *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoadingUnidades}
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
          name="quantidadeTotal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade total *</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="descricao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Input placeholder="Observações opcionais" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormShell>
  );
}
