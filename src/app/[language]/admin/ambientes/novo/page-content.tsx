"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/link";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import { useForm, useFormState, useWatch, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin-header";
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
import { useCreateAmbienteService } from "@/services/api/services/ambientes";
import {
  useGetUnidadesService,
  Unidade,
} from "@/services/api/services/unidades";
import {
  useGetTipoAmbientesService,
  TipoAmbiente,
} from "@/services/api/services/tipo-ambientes";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const schema = yup.object().shape({
  nome: yup.string().required("O nome do ambiente é obrigatório"),
  tipoAmbienteId: yup.string().required("O tipo de ambiente é obrigatório"),
  tipo: yup.string().required("A disponibilidade é obrigatória"),
  capacidade: yup
    .number()
    .typeError("Deve ser um número")
    .positive("Deve ser maior que zero")
    .required("A capacidade é obrigatória"),
  unidadeId: yup.string().required("A unidade é obrigatória"),
  bloco: yup.string().optional(),
  andar: yup.string().optional(),
  estacoesTrabalho: yup.number().optional().nullable(),
});

type FormData = {
  nome: string;
  tipoAmbienteId: string;
  tipo: string;
  capacidade: number;
  unidadeId: string;
  bloco?: string;
  andar?: string;
  estacoesTrabalho?: number | null;
};

export default function PageContent({ language }: { language: string }) {
  const router = useRouter();
  const createAmbiente = useCreateAmbienteService();
  const getUnidades = useGetUnidadesService();
  const getTipoAmbientes = useGetTipoAmbientesService();

  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [tipoAmbientes, setTipoAmbientes] = useState<TipoAmbiente[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(schema) as never,
    defaultValues: {
      tipo: "Grade fixa",
    },
  });

  const { errors } = useFormState({ control });
  const tipoAmbienteId = useWatch({ control, name: "tipoAmbienteId" });
  const tipoAmbienteSelecionado = tipoAmbientes.find(
    (t) => t.id === tipoAmbienteId
  );

  useEffect(() => {
    getUnidades()
      .then((res) =>
        setUnidades(res.status === HTTP_CODES_ENUM.OK ? res.data.data : [])
      )
      .catch(console.error);

    getTipoAmbientes({ limit: "500" })
      .then((res) =>
        setTipoAmbientes(res.status === HTTP_CODES_ENUM.OK ? res.data.data : [])
      )
      .catch(console.error);
  }, [getUnidades, getTipoAmbientes]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);

      const descricao = data.estacoesTrabalho
        ? `${data.estacoesTrabalho} estações de trabalho`
        : undefined;

      await createAmbiente({
        nome: data.nome,
        tipoAmbiente: { id: data.tipoAmbienteId },
        tipo: data.tipo,
        capacidade: data.capacidade,
        unidade: { id: data.unidadeId },
        bloco: data.bloco,
        andar: data.andar,
        descricao,
      });

      toast.success("Ambiente criado com sucesso!");
      router.push(`/${language}/admin/ambientes`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar ambiente. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdminHeader title="Novo Ambiente" />

      <div className="p-6 max-w-[800px] mx-auto w-full">
        <Link
          href="/admin/ambientes"
          className="inline-flex items-center text-sm font-medium text-[#6f767b] hover:text-[#1c1f21] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para ambientes
        </Link>

        <div className="bg-white rounded-xl border border-[#e6e5e0] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#f0efea]">
            <h2 className="text-xl font-semibold text-[#1c1f21] mb-1">
              Novo ambiente
            </h2>
            <p className="text-sm text-[#6f767b]">
              Preencha os dados abaixo. Os campos com asterisco (*) são
              obrigatórios.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome / identificação *</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Sala 302"
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
                  <Label>Tipo de ambiente *</Label>
                  <Controller
                    name="tipoAmbienteId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="bg-[#fbfaf7] border-[#dddbd3]">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {tipoAmbientes.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id}>
                              {tipo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.tipoAmbienteId && (
                    <p className="text-sm text-[#a8442f]">
                      {errors.tipoAmbienteId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Disponibilidade *</Label>
                  <Controller
                    name="tipo"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="bg-[#fbfaf7] border-[#dddbd3]">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Grade fixa">
                            Uso fixo semanal (grade)
                          </SelectItem>
                          <SelectItem value="Reservável">
                            Reservável sob demanda
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.tipo && (
                    <p className="text-sm text-[#a8442f]">
                      {errors.tipo.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacidade">Capacidade *</Label>
                  <Input
                    id="capacidade"
                    type="number"
                    placeholder="0"
                    className="bg-[#fbfaf7] border-[#dddbd3]"
                    {...register("capacidade")}
                  />
                  {errors.capacidade && (
                    <p className="text-sm text-[#a8442f]">
                      {errors.capacidade.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Unidade / campus *</Label>
                  <Controller
                    name="unidadeId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="bg-[#fbfaf7] border-[#dddbd3]">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {unidades.map((un) => (
                            <SelectItem key={un.id} value={un.id}>
                              {un.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.unidadeId && (
                    <p className="text-sm text-[#a8442f]">
                      {errors.unidadeId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloco">Bloco</Label>
                  <Input
                    id="bloco"
                    placeholder="Ex: B"
                    className="bg-[#fbfaf7] border-[#dddbd3]"
                    {...register("bloco")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="andar">Andar</Label>
                  <Input
                    id="andar"
                    placeholder="Ex: 3"
                    className="bg-[#fbfaf7] border-[#dddbd3]"
                    {...register("andar")}
                  />
                </div>

                {tipoAmbienteSelecionado?.nome.includes("Laboratório") && (
                  <div className="space-y-2">
                    <Label htmlFor="estacoesTrabalho">
                      Estações de trabalho
                    </Label>
                    <Input
                      id="estacoesTrabalho"
                      type="number"
                      placeholder="0"
                      className="bg-[#fbfaf7] border-[#dddbd3]"
                      {...register("estacoesTrabalho")}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-[#f0efea] bg-[#faf9f5] flex justify-end gap-3 rounded-b-xl">
              <Button
                type="button"
                variant="outline"
                className="border-[#dddbd3] text-[#1c1f21]"
                onClick={() => router.push(`/${language}/admin/ambientes`)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white"
                disabled={submitting}
              >
                {submitting ? "Salvando..." : "Salvar ambiente"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
