"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/link";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { useForm, useFormState, Controller } from "react-hook-form";
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
import {
  useGetItemPatrimonialService,
  useUpdateItemPatrimonialService,
} from "@/services/api/services/item-patrimonials";
import {
  useGetAmbientesService,
  Ambiente,
} from "@/services/api/services/ambientes";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const schema = yup.object().shape({
  nome: yup.string().required("O nome é obrigatório"),
  tipo: yup.string().required("O tipo é obrigatório"),
  ambienteId: yup.string().required("O ambiente é obrigatório"),
  numeroPatrimonio: yup.string().nullable(),
  estado: yup.string().required("O estado é obrigatório"),
});

type FormData = yup.InferType<typeof schema>;

export default function PageContent({ id }: { id: string }) {
  const router = useRouter();
  const getAmbientes = useGetAmbientesService();
  const getItem = useGetItemPatrimonialService();
  const updateItem = useUpdateItemPatrimonialService();

  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control, reset } = useForm<FormData>({
    resolver: yupResolver(schema) as never,
  });
  const { errors } = useFormState({ control });

  useEffect(() => {
    let isMounted = true;

    Promise.all([getAmbientes({ limit: "500" }), getItem({ id })])
      .then(([ambientesRes, itemRes]) => {
        if (!isMounted) return;

        if (ambientesRes.status === HTTP_CODES_ENUM.OK) {
          setAmbientes(ambientesRes.data.data || ambientesRes.data);
        }

        if (itemRes.status === HTTP_CODES_ENUM.OK && itemRes.data) {
          reset({
            nome: itemRes.data.nome,
            tipo: itemRes.data.tipo || "",
            ambienteId: itemRes.data.ambiente?.id || "",
            numeroPatrimonio: itemRes.data.numeroPatrimonio || "",
            estado: itemRes.data.estado || "funcionando",
          });
        } else {
          toast.error("Item patrimonial não encontrado.");
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) toast.error("Erro ao carregar dados.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, getAmbientes, getItem, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      const res = await updateItem({
        id,
        nome: data.nome,
        tipo: data.tipo,
        ambiente: { id: data.ambienteId },
        numeroPatrimonio: data.numeroPatrimonio || null,
        estado: data.estado,
      });

      if (res.status === HTTP_CODES_ENUM.OK) {
        toast.success("Item patrimonial atualizado com sucesso!");
        router.push("/admin/patrimonio");
      } else {
        toast.error("Erro ao atualizar item patrimonial.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar item patrimonial. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdminHeader title="Editar Item Patrimonial" />

      <div className="p-6 max-w-[600px] mx-auto w-full">
        <Link
          href="/admin/patrimonio"
          className="inline-flex items-center text-sm font-medium text-[#6f767b] hover:text-[#1c1f21] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para patrimônio
        </Link>

        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-[#e6e5e0]">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#e6e5e0] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#f0efea]">
              <h2 className="text-xl font-semibold text-[#1c1f21]">
                Editar item
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Projetor Epson"
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
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Input
                    id="tipo"
                    placeholder="Ex: Projetor, Ar Condicionado"
                    className="bg-[#fbfaf7] border-[#dddbd3]"
                    {...register("tipo")}
                  />
                  {errors.tipo && (
                    <p className="text-sm text-[#a8442f]">
                      {errors.tipo.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroPatrimonio">Número de Patrimônio</Label>
                  <Input
                    id="numeroPatrimonio"
                    placeholder="Opcional"
                    className="bg-[#fbfaf7] border-[#dddbd3]"
                    {...register("numeroPatrimonio")}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ambiente *</Label>
                  <Controller
                    name="ambienteId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="bg-[#fbfaf7] border-[#dddbd3]">
                          <SelectValue placeholder="Selecione o ambiente" />
                        </SelectTrigger>
                        <SelectContent>
                          {ambientes.map((amb) => (
                            <SelectItem key={amb.id} value={amb.id}>
                              {amb.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.ambienteId && (
                    <p className="text-sm text-[#a8442f]">
                      {errors.ambienteId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Estado *</Label>
                  <Controller
                    name="estado"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="bg-[#fbfaf7] border-[#dddbd3]">
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="funcionando">
                            Funcionando
                          </SelectItem>
                          <SelectItem value="com_defeito">
                            Com defeito
                          </SelectItem>
                          <SelectItem value="em_manutencao">
                            Em manutenção
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.estado && (
                    <p className="text-sm text-[#a8442f]">
                      {errors.estado.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-[#f0efea] bg-[#faf9f5] flex justify-end gap-3 rounded-b-xl">
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#dddbd3] text-[#1c1f21]"
                  onClick={() => router.push("/admin/patrimonio")}
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
      </div>
    </>
  );
}
