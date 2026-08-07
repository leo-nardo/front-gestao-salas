"use client";

import { useState } from "react";
import { useForm, Controller, useFormState } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetEquipamentosService } from "@/services/api/services/equipamentos";
import {
  useCreateSolicitacaoEquipamentoService,
  CreateSolicitacaoEquipamentoRequest,
} from "@/services/api/services/solicitacao-equipamentos";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const schema = yup.object().shape({
  equipamentoId: yup.string().required("Campo obrigatório"),
  quantidade: yup
    .number()
    .typeError("Deve ser um número")
    .positive("Deve ser maior que zero")
    .required("Campo obrigatório"),
  dataInicio: yup.string().required("Campo obrigatório"),
  dataFim: yup.string().required("Campo obrigatório"),
  finalidade: yup.string().required("Campo obrigatório"),
});

type FormData = yup.InferType<typeof schema>;

export default function PageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getEquipamentos = useGetEquipamentosService();
  const createSolicitacao = useCreateSolicitacaoEquipamentoService();

  const { data: eqRes, isLoading: isLoadingEq } = useQuery({
    queryKey: ["equipamentos"],
    queryFn: () => getEquipamentos(),
  });
  const equipamentos =
    eqRes?.status === HTTP_CODES_ENUM.OK ? eqRes.data.data : [];

  const { register, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(schema) as never,
  });
  const { errors } = useFormState({ control });

  const mutation = useMutation({
    mutationFn: (data: CreateSolicitacaoEquipamentoRequest) =>
      createSolicitacao(data),
    onSuccess: (res) => {
      if (res.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
        setErrorMessage(res.data.message || "Erro de validação");
      } else if (res.status === HTTP_CODES_ENUM.CREATED) {
        queryClient.invalidateQueries({
          queryKey: ["minhas-solicitacoes-equipamento"],
        });
        router.push("/professor/equipamentos");
      }
    },
  });

  const onSubmit = handleSubmit((data) => {
    setErrorMessage(null);
    mutation.mutate({
      equipamento: { id: data.equipamentoId },
      quantidade: data.quantidade,
      dataInicio: data.dataInicio,
      dataFim: data.dataFim,
      finalidade: data.finalidade,
    });
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link
          href="/professor/equipamentos"
          className="inline-flex items-center text-sm text-[#6f767b] hover:text-[#1c1f21] mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Link>
        <h1 className="text-3xl font-bold text-[#1c1f21] font-public-sans tracking-tight">
          Solicitar equipamento
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-[#e6e5e0] p-6 shadow-sm">
        <form onSubmit={onSubmit} className="space-y-6">
          {errorMessage && (
            <div className="bg-[#f7e7e2] text-[#a8442f] p-4 rounded-md text-sm mb-4">
              {errorMessage}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="equipamentoId">Equipamento</Label>
            <Controller
              name="equipamentoId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    className={
                      errors.equipamentoId
                        ? "border-[#a8442f]"
                        : "border-[#e6e5e0]"
                    }
                  >
                    <SelectValue placeholder="Selecione um equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingEq ? (
                      <div className="p-2 flex justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-[#1a4f8a]" />
                      </div>
                    ) : (
                      equipamentos.map((eq) => (
                        <SelectItem key={eq.id} value={eq.id}>
                          {eq.nome} ({eq.quantidadeDisponivel} disponíveis)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.equipamentoId && (
              <p className="text-sm text-[#a8442f]">
                {errors.equipamentoId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                {...register("quantidade")}
                className={`bg-[#fbfaf7] ${
                  errors.quantidade ? "border-[#a8442f]" : "border-[#e6e5e0]"
                }`}
              />
              {errors.quantidade && (
                <p className="text-sm text-[#a8442f]">
                  {errors.quantidade.message}
                </p>
              )}
            </div>
            <div></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                {...register("dataInicio")}
                className={`bg-[#fbfaf7] ${
                  errors.dataInicio ? "border-[#a8442f]" : "border-[#e6e5e0]"
                }`}
              />
              {errors.dataInicio && (
                <p className="text-sm text-[#a8442f]">
                  {errors.dataInicio.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                {...register("dataFim")}
                className={`bg-[#fbfaf7] ${
                  errors.dataFim ? "border-[#a8442f]" : "border-[#e6e5e0]"
                }`}
              />
              {errors.dataFim && (
                <p className="text-sm text-[#a8442f]">
                  {errors.dataFim.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="finalidade">Finalidade</Label>
            <Textarea
              id="finalidade"
              placeholder="Descreva para que o equipamento será utilizado"
              {...register("finalidade")}
              className={`bg-[#fbfaf7] min-h-[100px] ${
                errors.finalidade ? "border-[#a8442f]" : "border-[#e6e5e0]"
              }`}
            />
            {errors.finalidade && (
              <p className="text-sm text-[#a8442f]">
                {errors.finalidade.message}
              </p>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white w-full sm:w-auto"
              disabled={mutation.isPending}
            >
              {mutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Enviar solicitação
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
