"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/link";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import { useForm, useFormState, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateSolicitacaoTrocaSalaService } from "@/services/api/services/solicitacao-troca-salas";
import { useGetAulasService, Aula } from "@/services/api/services/aulas";
import {
  useGetAmbientesService,
  Ambiente,
} from "@/services/api/services/ambientes";
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
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(schema) as never,
  });
  const { errors } = useFormState({ control });

  useEffect(() => {
    getAulas()
      .then((res) =>
        setAulas(res.status === HTTP_CODES_ENUM.OK ? res.data.data : [])
      )
      .catch(console.error);
    getAmbientes()
      .then((res) =>
        setAmbientes(res.status === HTTP_CODES_ENUM.OK ? res.data.data : [])
      )
      .catch(console.error);
  }, [getAulas, getAmbientes]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      await createSolicitacao({
        aula: { id: data.aulaId },
        ambienteSugerido: data.ambienteSugeridoId
          ? { id: data.ambienteSugeridoId }
          : undefined,
        justificativa: data.justificativa,
      });
      toast.success("Solicitação enviada!");
      router.push("/auxiliar/solicitacoes");
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
        href="/auxiliar/solicitacoes"
        className="inline-flex items-center text-sm font-medium text-[#6f767b] hover:text-[#1c1f21] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar
      </Link>

      <div className="bg-white rounded-xl border border-[#e6e5e0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#f0efea]">
          <h2 className="text-xl font-semibold text-[#1c1f21]">
            Nova solicitação de troca de sala
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label>Aula *</Label>
              <Controller
                name="aulaId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-[#fbfaf7] border-[#dddbd3]">
                      <SelectValue placeholder="Selecione a aula" />
                    </SelectTrigger>
                    <SelectContent>
                      {aulas.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.disciplina.nome} · {a.turma.codigo} · {a.diaSemana}{" "}
                          {a.horarioInicio}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.aulaId && (
                <p className="text-sm text-[#a8442f]">
                  {errors.aulaId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Ambiente sugerido (opcional)</Label>
              <Controller
                name="ambienteSugeridoId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-[#fbfaf7] border-[#dddbd3]">
                      <SelectValue placeholder="Deixe o admin escolher" />
                    </SelectTrigger>
                    <SelectContent>
                      {ambientes.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="justificativa">Justificativa *</Label>
              <Textarea
                id="justificativa"
                placeholder="Ex: Ar-condicionado quebrado, projetor com defeito..."
                className="bg-[#fbfaf7] border-[#dddbd3]"
                {...register("justificativa")}
              />
              {errors.justificativa && (
                <p className="text-sm text-[#a8442f]">
                  {errors.justificativa.message}
                </p>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-[#f0efea] bg-[#faf9f5] flex justify-end gap-3 rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              className="border-[#dddbd3] text-[#1c1f21]"
              onClick={() => router.push("/auxiliar/solicitacoes")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white"
              disabled={submitting}
            >
              {submitting ? "Enviando..." : "Enviar solicitação"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
