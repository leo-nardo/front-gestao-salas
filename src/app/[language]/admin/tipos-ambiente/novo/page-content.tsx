"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/link";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import { useForm, useFormState } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTipoAmbienteService } from "@/services/api/services/tipo-ambientes";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const schema = yup.object().shape({
  nome: yup.string().required("O nome é obrigatório"),
  descricao: yup.string().optional(),
});

type FormData = yup.InferType<typeof schema>;

export default function PageContent() {
  const router = useRouter();
  const createTipo = useCreateTipoAmbienteService();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(schema) as never,
    defaultValues: {
      nome: "",
      descricao: "",
    },
  });
  const { errors } = useFormState({ control });

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      const res = await createTipo({
        nome: data.nome,
        descricao: data.descricao || undefined,
      });

      if (
        res.status === HTTP_CODES_ENUM.CREATED ||
        res.status === HTTP_CODES_ENUM.OK
      ) {
        toast.success("Tipo de ambiente cadastrado com sucesso!");
        router.push("/admin/tipos-ambiente");
      } else {
        toast.error("Erro ao cadastrar tipo de ambiente.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cadastrar tipo de ambiente. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdminHeader title="Novo Tipo de Ambiente" />

      <div className="p-6 max-w-[600px] mx-auto w-full">
        <Link
          href="/admin/tipos-ambiente"
          className="inline-flex items-center text-sm font-medium text-[#6f767b] hover:text-[#1c1f21] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para tipos de ambiente
        </Link>

        <div className="bg-white rounded-xl border border-[#e6e5e0] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#f0efea]">
            <h2 className="text-xl font-semibold text-[#1c1f21]">
              Cadastrar tipo
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Sala comum"
                  className="bg-[#fbfaf7] border-[#dddbd3]"
                  {...register("nome")}
                />
                {errors.nome && (
                  <p className="text-sm text-[#a8442f]">
                    {errors.nome.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Opcional"
                  className="bg-[#fbfaf7] border-[#dddbd3] min-h-[100px]"
                  {...register("descricao")}
                />
              </div>
            </div>

            <div className="p-6 border-t border-[#f0efea] bg-[#faf9f5] flex justify-end gap-3 rounded-b-xl">
              <Link href="/admin/tipos-ambiente">
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#dddbd3] text-[#1c1f21]"
                >
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white"
                disabled={submitting}
              >
                {submitting ? "Salvando..." : "Cadastrar tipo"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
