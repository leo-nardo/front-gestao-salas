"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/link";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { useForm, useFormState, useWatch, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AmbientePatrimonioSection } from "@/components/ambiente-patrimonio-section";
import {
  useGetAmbienteService,
  useUpdateAmbienteService,
} from "@/services/api/services/ambientes";
import {
  useGetUnidadesService,
  Unidade,
} from "@/services/api/services/unidades";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const schema = yup.object().shape({
  nome: yup.string().required("O nome do ambiente é obrigatório"),
  categoria: yup.string().required("A categoria é obrigatória"),
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
  caracteristicas: yup.array().of(yup.string()).optional(),
});

type FormData = {
  nome: string;
  categoria: string;
  tipo: string;
  capacidade: number;
  unidadeId: string;
  bloco?: string;
  andar?: string;
  estacoesTrabalho?: number | null;
  caracteristicas?: (string | undefined)[];
};

const CARACTERISTICAS = [
  "Projetor fixo",
  "Ar-condicionado",
  "Som fixo",
  "Palco",
  "Lousa digital",
  "Bancadas",
];

export default function PageContent({
  id,
  language,
}: {
  id: string;
  language: string;
}) {
  const router = useRouter();
  const getAmbiente = useGetAmbienteService();
  const updateAmbiente = useUpdateAmbienteService();
  const getUnidades = useGetUnidadesService();

  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control, reset } = useForm<FormData>({
    resolver: yupResolver(schema) as never,
    defaultValues: {
      categoria: "Sala",
      tipo: "Grade fixa",
      caracteristicas: [],
    },
  });

  const { errors } = useFormState({ control });
  const categoria = useWatch({ control, name: "categoria" });

  useEffect(() => {
    getUnidades()
      .then((res) =>
        setUnidades(res.status === HTTP_CODES_ENUM.OK ? res.data.data : [])
      )
      .catch(console.error);
  }, [getUnidades]);

  useEffect(() => {
    let isMounted = true;
    getAmbiente(id)
      .then((res) => {
        if (!isMounted) return;
        if (res.status === HTTP_CODES_ENUM.OK && res.data) {
          const amb = res.data;
          const rawDesc = amb.descricao || "";
          const parts = rawDesc
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean);
          const featList: string[] = [];
          let estacoes: number | null = null;

          parts.forEach((p) => {
            if (p.includes("estações de trabalho")) {
              const match = p.match(/(\d+)/);
              if (match) estacoes = parseInt(match[1], 10);
            } else if (CARACTERISTICAS.includes(p)) {
              featList.push(p);
            }
          });

          reset({
            nome: amb.nome || "",
            categoria: amb.categoria || "Sala",
            tipo: amb.tipo || "Grade fixa",
            capacidade: amb.capacidade || 0,
            unidadeId: amb.unidade?.id || "",
            bloco: amb.bloco || "",
            andar: amb.andar || "",
            estacoesTrabalho: estacoes,
            caracteristicas: featList,
          });
        } else {
          toast.error("Ambiente não encontrado.");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Erro ao carregar ambiente.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, getAmbiente, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);

      const descricaoParts = (data.caracteristicas || []).filter(
        (c): c is string => Boolean(c)
      );
      if (data.estacoesTrabalho) {
        descricaoParts.push(`${data.estacoesTrabalho} estações de trabalho`);
      }
      const descricao =
        descricaoParts.length > 0 ? descricaoParts.join(", ") : undefined;

      const res = await updateAmbiente(id, {
        nome: data.nome,
        categoria: data.categoria,
        tipo: data.tipo,
        capacidade: data.capacidade,
        unidade: { id: data.unidadeId },
        bloco: data.bloco || undefined,
        andar: data.andar || undefined,
        descricao,
      });

      if (res.status === HTTP_CODES_ENUM.OK) {
        toast.success("Ambiente atualizado com sucesso!");
        router.push(`/${language}/admin/ambientes`);
      } else {
        toast.error("Erro ao atualizar ambiente.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar ambiente. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdminHeader title="Editar Ambiente" />

      <div className="p-6 max-w-[800px] mx-auto w-full">
        <Link
          href="/admin/ambientes"
          className="inline-flex items-center text-sm font-medium text-[#6f767b] hover:text-[#1c1f21] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para ambientes
        </Link>

        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-[#e6e5e0]">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#e6e5e0] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#f0efea]">
              <h2 className="text-xl font-semibold text-[#1c1f21] mb-1">
                Editar ambiente
              </h2>
              <p className="text-sm text-[#6f767b]">
                Altere os dados do ambiente conforme necessário.
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
                    <Label>Categoria *</Label>
                    <Controller
                      name="categoria"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Sala" id="cat-sala" />
                            <Label
                              htmlFor="cat-sala"
                              className="font-normal cursor-pointer"
                            >
                              Sala comum
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Laboratório" id="cat-lab" />
                            <Label
                              htmlFor="cat-lab"
                              className="font-normal cursor-pointer"
                            >
                              Laboratório
                            </Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                    {errors.categoria && (
                      <p className="text-sm text-[#a8442f]">
                        {errors.categoria.message}
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

                  {categoria === "Laboratório" && (
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

                <div className="space-y-3 pt-4 border-t border-[#f0efea]">
                  <Label>Características físicas</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Controller
                      name="caracteristicas"
                      control={control}
                      render={({ field }) => (
                        <>
                          {CARACTERISTICAS.map((feature) => (
                            <div
                              key={feature}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`feature-${feature}`}
                                checked={(field.value || []).includes(feature)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, feature]);
                                  } else {
                                    field.onChange(
                                      current.filter((c) => c !== feature)
                                    );
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`feature-${feature}`}
                                className="font-normal cursor-pointer text-sm"
                              >
                                {feature}
                              </Label>
                            </div>
                          ))}
                        </>
                      )}
                    />
                  </div>
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
                  {submitting ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {!loading && <AmbientePatrimonioSection ambienteId={id} />}
      </div>
    </>
  );
}
