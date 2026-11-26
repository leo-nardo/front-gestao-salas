"use client";

import { routes } from "@/routes";
import { useState } from "react";
import { FormShell } from "@/components/form-shell";
import { useForm } from "react-hook-form";
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
import { applyApiFormErrors } from "@/services/api/apply-api-form-errors";
import { RoleEnum } from "@/services/api/types/role";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const schema = yup.object().shape({
  firstName: yup.string().required("O nome é obrigatório"),
  lastName: yup.string().required("O sobrenome é obrigatório"),
  email: yup
    .string()
    .email("Insira um e-mail válido")
    .required("O e-mail é obrigatório"),
  roleId: yup.string().required("O papel é obrigatório"),
});

export type UsuarioFormData = yup.InferType<typeof schema>;

const ROLE_OPTIONS = [
  { id: RoleEnum.ADMIN, label: "Admin" },
  { id: RoleEnum.PROFESSOR, label: "Professor" },
  { id: RoleEnum.ALUNO, label: "Aluno" },
  { id: RoleEnum.AUXILIAR_AUDIOVISUAL, label: "Auxiliar Audiovisual" },
  { id: RoleEnum.LIMPEZA, label: "Limpeza" },
  { id: RoleEnum.TECNICO_LABORATORIO, label: "Técnico de Laboratório" },
];

type ApiResult =
  | {
      status: typeof HTTP_CODES_ENUM.OK | typeof HTTP_CODES_ENUM.CREATED;
      data: unknown;
    }
  | {
      status: number;
      data?: { errors?: Record<string, string>; message?: string };
    };

type UsuarioFormProps = {
  /** `page` (padrão): tela própria. `drawer`: campos + rodapé dentro de um Sheet. */
  variant?: "page" | "drawer";
  /** Cancelar na variante `drawer`. */
  onCancel?: () => void;
  title: string;
  description?: string;
  submitLabel: string;
  submittingLabel: string;
  successMessage: string;
  showInviteNotice?: boolean;
  defaultValues?: Partial<UsuarioFormData>;
  onSave: (data: UsuarioFormData) => Promise<ApiResult>;
  onSaved: () => void;
};

export function UsuarioForm({
  variant = "page",
  onCancel,
  title,
  description,
  submitLabel,
  submittingLabel,
  successMessage,
  showInviteNotice,
  defaultValues,
  onSave,
  onSaved,
}: UsuarioFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<UsuarioFormData>({
    resolver: yupResolver(schema) as never,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      roleId: "",
      ...defaultValues,
    },
    values: defaultValues as UsuarioFormData | undefined,
  });

  const onSubmit = async (data: UsuarioFormData) => {
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
      if (
        res.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY &&
        res.data?.errors?.email === "emailAlreadyExists"
      ) {
        form.setError("email", {
          type: "server",
          message: "E-mail já cadastrado no sistema.",
        });
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
      description={description}
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      submitting={submitting}
      submitLabel={submitLabel}
      submittingLabel={submittingLabel}
      backHref={routes.usuarios.admin.list()}
      backLabel="Voltar para usuários"
      onCancel={onCancel}
      width="max-w-[600px]"
    >
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: João" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sobrenome *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail *</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="Ex: joao.silva@exemplo.com"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {showInviteNotice && (
        <div className="rounded-lg border bg-surface-4 p-4 text-sm text-muted-foreground">
          A pessoa ainda não terá senha definida. Depois de salvar, envie o
          convite de primeiro acesso na lista de usuários para que ela possa
          criar sua própria senha.
        </div>
      )}

      <FormField
        control={form.control}
        name="roleId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Papel *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.id} value={String(opt.id)}>
                    {opt.label}
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
