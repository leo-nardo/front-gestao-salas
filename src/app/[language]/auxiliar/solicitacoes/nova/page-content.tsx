"use client";

import { routes } from "@/routes";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
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
import { useCreateSolicitacaoTrocaSalaService } from "@/services/api/services/solicitacao-troca-salas";
import { useGetAulasService } from "@/services/api/services/aulas";
import { useGetAmbientesService } from "@/services/api/services/ambientes";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const schema = yup.object().shape({
  aulaId: yup.string().required("Selecione a aula"),
  ambienteSugeridoId: yup.string().optional(),
  justificativa: yup.string().required("Descreva o motivo da troca"),
});

type FormData = yup.InferType<typeof schema>;

export default function PageContent() {
  const router = useRouter();
  const createSolicitacao = useCreateSolicitacaoTrocaSalaService();
  const getAulas = useGetAulasService();
  const getAmbientes = useGetAmbientesService();
  const [submitting, setSubmitting] = useState(false);

  const { data: aulasRes, isLoading: isLoadingAulas } = useQuery({
    queryKey: ["aulas"],
    queryFn: () => getAulas(),
  });
  const aulas =
    aulasRes?.status === HTTP_CODES_ENUM.OK ? aulasRes.data.data : [];

  const { data: ambientesRes, isLoading: isLoadingAmbientes } = useQuery({
    queryKey: ["ambientes"],
    queryFn: () => getAmbientes(),
  });
  const ambientes =
    ambientesRes?.status === HTTP_CODES_ENUM.OK ? ambientesRes.data.data : [];

  const form = useForm<FormData>({
    resolver: yupResolver(schema) as never,
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await createSolicitacao({
        aula: { id: data.aulaId },
        ambienteSugerido: data.ambienteSugeridoId
          ? { id: data.ambienteSugeridoId }
          : undefined,
        justificativa: data.justificativa,
      });

      if (
        res.status === HTTP_CODES_ENUM.OK ||
        res.status === HTTP_CODES_ENUM.CREATED
      ) {
        toast.success("Solicitação enviada!");
        router.push(routes.solicitacoes.auxiliar.list());
        return;
      }
      applyApiFormErrors(res as never, form.setError);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[700px] mx-auto">
      <Link
        href={routes.solicitacoes.auxiliar.list()}
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar
      </Link>

      <Card>
        <CardHeader className="border-b pb-6">
          <CardTitle className="text-xl">
            Nova solicitação de troca de sala
          </CardTitle>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 pt-6">
              <FormField
                control={form.control}
                name="aulaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aula *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingAulas}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione a aula" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {aulas.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.disciplina.nome} · {a.turma.codigo} ·{" "}
                            {a.diaSemana} {a.horarioInicio}
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
                name="ambienteSugeridoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ambiente sugerido (opcional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingAmbientes}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Deixe o admin escolher" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ambientes.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.nome}
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
                name="justificativa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Justificativa *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Ar-condicionado quebrado, projetor com defeito..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="border-t bg-surface-3 py-6 flex justify-end gap-3 rounded-b-xl">
              <Link href={routes.solicitacoes.auxiliar.list()}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Enviando..." : "Enviar solicitação"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
