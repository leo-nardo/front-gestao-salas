"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/link";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import { useForm, useFormState, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthInviteUserService } from "@/services/api/services/auth";
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

type FormData = yup.InferType<typeof schema>;

const ROLE_OPTIONS = [
  { id: RoleEnum.ADMIN, label: "Admin" },
  { id: RoleEnum.PROFESSOR, label: "Professor" },
  { id: RoleEnum.ALUNO, label: "Aluno" },
  { id: RoleEnum.AUXILIAR_AUDIOVISUAL, label: "Auxiliar Audiovisual" },
  { id: RoleEnum.LIMPEZA, label: "Limpeza" },
  { id: RoleEnum.TECNICO_LABORATORIO, label: "Técnico de Laboratório" },
];

export default function PageContent() {
  const router = useRouter();
  const inviteUser = useAuthInviteUserService();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(schema) as never,
  });
  const { errors } = useFormState({ control });

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      const res = await inviteUser({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: { id: Number(data.roleId) },
      });

      if (res.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        toast.error("E-mail já cadastrado no sistema.");
        return;
      }

      if (
        res.status !== HTTP_CODES_ENUM.CREATED &&
        res.status !== HTTP_CODES_ENUM.OK
      ) {
        toast.error("Erro ao cadastrar usuário. Tente novamente.");
        return;
      }

      toast.success(
        "Usuário pré-cadastrado! Envie o convite de acesso na lista de usuários."
      );
      router.push("/admin/usuarios");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cadastrar usuário. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-[600px] mx-auto w-full">
      <Link
        href="/admin/usuarios"
        className="inline-flex items-center text-sm font-medium text-[#6f767b] hover:text-[#1c1f21] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para usuários
      </Link>

      <div className="bg-white rounded-xl border border-[#e6e5e0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#f0efea]">
          <h2 className="text-xl font-semibold text-[#1c1f21]">Novo usuário</h2>
          <p className="text-sm text-[#6f767b] mt-1">
            Preencha as informações para cadastrar uma nova pessoa no sistema.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome *</Label>
                <Input
                  id="firstName"
                  placeholder="Ex: João"
                  className="bg-[#fbfaf7] border-[#dddbd3]"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-sm text-[#a8442f]">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome *</Label>
                <Input
                  id="lastName"
                  placeholder="Ex: Silva"
                  className="bg-[#fbfaf7] border-[#dddbd3]"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-sm text-[#a8442f]">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ex: joao.silva@exemplo.com"
                className="bg-[#fbfaf7] border-[#dddbd3]"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-[#a8442f]">{errors.email.message}</p>
              )}
            </div>

            <div className="rounded-lg border border-[#dddbd3] bg-[#fbfaf7] p-4 text-sm text-[#6f767b]">
              A pessoa ainda não terá senha definida. Depois de salvar, envie o
              convite de primeiro acesso na lista de usuários para que ela possa
              criar sua própria senha.
            </div>

            <div className="space-y-2">
              <Label>Papel *</Label>
              <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-[#fbfaf7] border-[#dddbd3]">
                      <SelectValue placeholder="Selecione o papel" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} value={String(opt.id)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.roleId && (
                <p className="text-sm text-[#a8442f]">
                  {errors.roleId.message}
                </p>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-[#f0efea] bg-[#faf9f5] flex justify-end gap-3 rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              className="border-[#dddbd3] text-[#1c1f21]"
              onClick={() => router.push("/admin/usuarios")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white"
              disabled={submitting}
            >
              {submitting ? "Salvando..." : "Salvar usuário"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
