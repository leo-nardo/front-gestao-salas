"use client";

import { useEffect, useState } from "react";
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
import { useCreateEquipamentoService } from "@/services/api/services/equipamentos";
import {
  useGetUnidadesService,
  Unidade,
} from "@/services/api/services/unidades";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

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

type FormData = yup.InferType<typeof schema>;

export default function PageContent() {
  const router = useRouter();
  const createEquipamento = useCreateEquipamentoService();
  const getUnidades = useGetUnidadesService();
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(schema) as never,
  });
  const { errors } = useFormState({ control });

  useEffect(() => {
    getUnidades()
      .then((res) =>
        setUnidades(res.status === HTTP_CODES_ENUM.OK ? res.data.data : [])
      )
      .catch(console.error);
  }, [getUnidades]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      await createEquipamento({
        nome: data.nome,
        tipo: data.tipo,
        unidade: { id: data.unidadeId },
        quantidadeTotal: data.quantidadeTotal,
        quantidadeDisponivel: data.quantidadeTotal,
        descricao: data.descricao,
      });
      toast.success("Equipamento criado com sucesso!");
      router.push("/admin/equipamentos");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar equipamento. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-[700px] mx-auto w-full">
      <Link
        href="/admin/equipamentos"
        className="inline-flex items-center text-sm font-medium text-[#6f767b] hover:text-[#1c1f21] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para equipamentos
      </Link>

      <div className="bg-white rounded-xl border border-[#e6e5e0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#f0efea]">
          <h2 className="text-xl font-semibold text-[#1c1f21]">
            Novo equipamento
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                placeholder="Ex: Projetor portátil EPSON"
                className="bg-[#fbfaf7] border-[#dddbd3]"
                {...register("nome")}
              />
              {errors.nome && (
                <p className="text-sm text-[#a8442f]">{errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Input
                id="tipo"
                placeholder="Ex: Projetor, Caixa de som, Notebook"
                className="bg-[#fbfaf7] border-[#dddbd3]"
                {...register("tipo")}
              />
              {errors.tipo && (
                <p className="text-sm text-[#a8442f]">{errors.tipo.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Unidade *</Label>
                <Controller
                  name="unidadeId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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
                <Label htmlFor="quantidadeTotal">Quantidade total *</Label>
                <Input
                  id="quantidadeTotal"
                  type="number"
                  placeholder="0"
                  className="bg-[#fbfaf7] border-[#dddbd3]"
                  {...register("quantidadeTotal")}
                />
                {errors.quantidadeTotal && (
                  <p className="text-sm text-[#a8442f]">
                    {errors.quantidadeTotal.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                placeholder="Observações opcionais"
                className="bg-[#fbfaf7] border-[#dddbd3]"
                {...register("descricao")}
              />
            </div>
          </div>

          <div className="p-6 border-t border-[#f0efea] bg-[#faf9f5] flex justify-end gap-3 rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              className="border-[#dddbd3] text-[#1c1f21]"
              onClick={() => router.push("/admin/equipamentos")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white"
              disabled={submitting}
            >
              {submitting ? "Salvando..." : "Salvar equipamento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
