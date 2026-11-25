"use client";

import { routes } from "@/routes";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { applyApiFormErrors } from "@/services/api/apply-api-form-errors";
import { useGetEquipamentosService } from "@/services/api/services/equipamentos";
import { useCreateSolicitacaoEquipamentoService } from "@/services/api/services/solicitacao-equipamentos";
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
  const [submitting, setSubmitting] = useState(false);

  const getEquipamentos = useGetEquipamentosService();
  const createSolicitacao = useCreateSolicitacaoEquipamentoService();

  const { data: eqRes, isLoading: isLoadingEq } = useQuery({
    queryKey: ["equipamentos"],
    queryFn: () => getEquipamentos(),
  });
  const equipamentos =
    eqRes?.status === HTTP_CODES_ENUM.OK ? eqRes.data.data : [];

  const form = useForm<FormData>({
    resolver: yupResolver(schema) as never,
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await createSolicitacao({
        equipamento: { id: data.equipamentoId },
        quantidade: data.quantidade,
        dataInicio: data.dataInicio,
        dataFim: data.dataFim,
        finalidade: data.finalidade,
      });

      if (res.status === HTTP_CODES_ENUM.CREATED) {
        toast.success("Solicitação enviada com sucesso!");
        router.push(routes.equipamentos.professor.list());
        return;
      }
      applyApiFormErrors(res as never, form.setError);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível enviar a solicitação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href={routes.equipamentos.professor.list()}
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar
      </Link>

      <Card>
        <CardHeader className="border-b pb-6">
          <CardTitle className="text-xl">Solicitar equipamento</CardTitle>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 pt-6">
              <FormField
                control={form.control}
                name="equipamentoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipamento *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingEq}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um equipamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {equipamentos.map((eq) => (
                          <SelectItem key={eq.id} value={eq.id}>
                            {eq.nome} ({eq.quantidadeDisponivel} disponíveis)
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
                name="quantidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade *</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dataInicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data início *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dataFim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data fim *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="finalidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Finalidade *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva para que o equipamento será utilizado"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="border-t bg-surface-3 py-6 flex justify-end gap-3 rounded-b-xl">
              <Link href={routes.equipamentos.professor.list()}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Enviar solicitação
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
