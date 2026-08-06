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
import { useCreateReservaService } from "@/services/api/services/reservas";
import {
  useGetAmbientesService,
  Ambiente,
} from "@/services/api/services/ambientes";
import useAuth from "@/services/auth/use-auth";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const timeOptions = Array.from({ length: 31 }, (_, i) => {
  const hours = Math.floor(i / 2) + 7;
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
});

const schema = yup.object().shape({
  ambienteId: yup.string().required("O ambiente é obrigatório"),
  data: yup.string().required("A data é obrigatória"),
  horarioInicio: yup.string().required("O horário de início é obrigatório"),
  horarioFim: yup.string().required("O horário de fim é obrigatório"),
  titulo: yup.string().required("O título é obrigatório"),
  descricao: yup.string().optional(),
});

type FormData = yup.InferType<typeof schema>;

export default function PageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const createReserva = useCreateReservaService();
  const getAmbientes = useGetAmbientesService();
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  const { register, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(schema) as never,
  });
  const { errors } = useFormState({ control });

  useEffect(() => {
    getAmbientes()
      .then((res) =>
        setAmbientes(res.status === HTTP_CODES_ENUM.OK ? res.data.data : [])
      )
      .catch(console.error);
  }, [getAmbientes]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    try {
      setSubmitting(true);
      setConflictMessage(null);
      const res = await createReserva({
        ambiente: { id: data.ambienteId },
        solicitante: { id: String(user.id) },
        data: data.data,
        horarioInicio: data.horarioInicio,
        horarioFim: data.horarioFim,
        titulo: data.titulo,
        descricao: data.descricao,
        eventoAberto: false,
      });

      if (res.status === HTTP_CODES_ENUM.CONFLICT) {
        setConflictMessage(res.data.message);
        toast.error(res.data.message);
        return;
      }
      if (res.status !== HTTP_CODES_ENUM.CREATED) {
        toast.error("Erro ao criar reserva. Tente novamente.");
        return;
      }
      toast.success("Reserva criada com sucesso!");
      router.push("/professor/reservas");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar reserva. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-[700px] mx-auto w-full">
      <Link
        href="/professor/reservas"
        className="inline-flex items-center text-sm font-medium text-[#6f767b] hover:text-[#1c1f21] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para reservas
      </Link>

      <div className="bg-white rounded-xl border border-[#e6e5e0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#f0efea]">
          <h2 className="text-xl font-semibold text-[#1c1f21]">Nova reserva</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                placeholder="Ex: Aula de reposição / Reunião"
                className="bg-[#fbfaf7] border-[#dddbd3]"
                {...register("titulo")}
              />
              {errors.titulo && (
                <p className="text-sm text-[#a8442f]">
                  {errors.titulo.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Ambiente *</Label>
              <Controller
                name="ambienteId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-[#fbfaf7] border-[#dddbd3]">
                      <SelectValue placeholder="Selecione o ambiente" />
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
              {errors.ambienteId && (
                <p className="text-sm text-[#a8442f]">
                  {errors.ambienteId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  className="bg-[#fbfaf7] border-[#dddbd3]"
                  {...register("data")}
                />
                {errors.data && (
                  <p className="text-sm text-[#a8442f]">
                    {errors.data.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Início *</Label>
                <Controller
                  name="horarioInicio"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-[#fbfaf7] border-[#dddbd3] font-ibm-plex-mono">
                        <SelectValue placeholder="00:00" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.horarioInicio && (
                  <p className="text-sm text-[#a8442f]">
                    {errors.horarioInicio.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Fim *</Label>
                <Controller
                  name="horarioFim"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-[#fbfaf7] border-[#dddbd3] font-ibm-plex-mono">
                        <SelectValue placeholder="00:00" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.horarioFim && (
                  <p className="text-sm text-[#a8442f]">
                    {errors.horarioFim.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                placeholder="Detalhes opcionais"
                className="bg-[#fbfaf7] border-[#dddbd3]"
                {...register("descricao")}
              />
            </div>

            {conflictMessage && (
              <div className="p-3 rounded-md bg-[#f7e7e2] text-[#a8442f] border border-[#e6b3a6] text-sm">
                {conflictMessage}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-[#f0efea] bg-[#faf9f5] flex justify-end gap-3 rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              className="border-[#dddbd3] text-[#1c1f21]"
              onClick={() => router.push("/professor/reservas")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white"
              disabled={submitting}
            >
              {submitting ? "Salvando..." : "Salvar reserva"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
