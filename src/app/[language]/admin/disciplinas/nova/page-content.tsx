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
import { useCreateDisciplinaService } from "@/services/api/services/disciplinas";
import { useGetCursosService, Curso } from "@/services/api/services/cursos";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const schema = yup.object().shape({
  nome: yup.string().required("O nome é obrigatório"),
  cursoId: yup.string().required("O curso é obrigatório"),
});

type FormData = yup.InferType<typeof schema>;

export default function PageContent() {
  const router = useRouter();
  const createDisciplina = useCreateDisciplinaService();
  const getCursos = useGetCursosService();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control } = useForm<FormData>({
    resolver: yupResolver(schema),
  });
  const { errors } = useFormState({ control });

  useEffect(() => {
    getCursos()
      .then((res) =>
        setCursos(res.status === HTTP_CODES_ENUM.OK ? res.data : [])
      )
      .catch(console.error);
  }, [getCursos]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      await createDisciplina({
        nome: data.nome,
        curso: { id: data.cursoId },
      });
      toast.success("Disciplina criada com sucesso!");
      router.push("/admin/disciplinas");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar disciplina. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-[600px] mx-auto w-full">
      <Link
        href="/admin/disciplinas"
        className="inline-flex items-center text-sm font-medium text-[#6f767b] hover:text-[#1c1f21] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar para disciplinas
      </Link>

      <div className="bg-white rounded-xl border border-[#e6e5e0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#f0efea]">
          <h2 className="text-xl font-semibold text-[#1c1f21]">
            Nova disciplina
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                placeholder="Ex: Direito Constitucional I"
                className="bg-[#fbfaf7] border-[#dddbd3]"
                {...register("nome")}
              />
              {errors.nome && (
                <p className="text-sm text-[#a8442f]">{errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Curso *</Label>
              <Controller
                name="cursoId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-[#fbfaf7] border-[#dddbd3]">
                      <SelectValue placeholder="Selecione o curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {cursos.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.cursoId && (
                <p className="text-sm text-[#a8442f]">
                  {errors.cursoId.message}
                </p>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-[#f0efea] bg-[#faf9f5] flex justify-end gap-3 rounded-b-xl">
            <Button
              type="button"
              variant="outline"
              className="border-[#dddbd3] text-[#1c1f21]"
              onClick={() => router.push("/admin/disciplinas")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#1a4f8a] hover:bg-[#123c6e] text-white"
              disabled={submitting}
            >
              {submitting ? "Salvando..." : "Salvar disciplina"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
