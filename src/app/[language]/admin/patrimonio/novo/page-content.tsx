"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "@/components/link";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
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
import { useCreateItemPatrimonialService } from "@/services/api/services/item-patrimonials";
import {
  useGetAmbientesService,
  Ambiente,
} from "@/services/api/services/ambientes";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const schema = yup.object().shape({
  nome: yup.string().required("O nome é obrigatório"),
  tipo: yup.string().required("O tipo é obrigatório"),
  ambienteId: yup.string().required("O ambiente é obrigatório"),
  numeroPatrimonio: yup.string().optional(),
  estado: yup.string().required("O estado é obrigatório"),
});

type FormData = yup.InferType<typeof schema>;

export default function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultAmbiente = searchParams.get("ambiente");

  const createItem = useCreateItemPatrimonialService();
  const getAmbientes = useGetAmbientesService();

  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(schema) as never,
    defaultValues: {
      estado: "funcionando",
      ambienteId: defaultAmbiente || "",
    },
  });
  const { errors } = useFormState({ control });

  useEffect(() => {
    let isMounted = true;

    getAmbientes()
      .then((res) => {
        if (!isMounted) return;
        if (res.status === HTTP_CODES_ENUM.OK) {
          setAmbientes(res.data.data || res.data);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) toast.error("Erro ao carregar ambientes.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [getAmbientes]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      const res = await createItem({
        nome: data.nome,
        tipo: data.tipo,
        ambiente: { id: data.ambienteId },
        numeroPatrimonio: data.numeroPatrimonio || undefined,
        estado: data.estado,
      });

      if (
        res.status === HTTP_CODES_ENUM.CREATED ||
        res.status === HTTP_CODES_ENUM.OK
      ) {
        toast.success("Item patrimonial cadastrado com sucesso!");
        if (defaultAmbiente) {
          router.push(`/admin/patrimonio?ambiente=${defaultAmbiente}`);
        } else {
          router.push("/admin/patrimonio");
        }
      } else {
        toast.error("Erro ao cadastrar item patrimonial.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cadastrar item patrimonial. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdminHeader title="Novo Item Patrimonial" />

      <div className="p-6 max-w-[600px] mx-auto w-full">
        <Link
          href={`/admin/patrimonio${defaultAmbiente ? `?ambiente=${defaultAmbiente}` : ""}`}
          className="inline-flex items-center text-sm font-medium text-[#6f767b] hover:text-[#1c1f21] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para patrimônio
        </Link>

        <div className="bg-white rounded-xl border border-[#e6e5e0] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#f0efea]">
            <h2 className="text-xl font-semibold text-[#1c1f21]">
              Cadastrar item
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#6f767b]">Carregando...</div>
          ) : (
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
                <Link
                  href={`/admin/patrimonio${defaultAmbiente ? `?ambiente=${defaultAmbiente}` : ""}`}
                >
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
                  {submitting ? "Salvando..." : "Cadastrar item"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
