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
  useGetDisciplinaService,
  useUpdateDisciplinaService,
} from "@/services/api/services/disciplinas";
import { useGetCursosService, Curso } from "@/services/api/services/cursos";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";

const schema = yup.object().shape({
  nome: yup.string().required("O nome é obrigatório"),
  cursoId: yup.string().required("O curso é obrigatório"),
});

type FormData = yup.InferType<typeof schema>;

export default function PageContent({ id }: { id: string }) {
  const router = useRouter();
  const getDisciplina = useGetDisciplinaService();
  const updateDisciplina = useUpdateDisciplinaService();
  const getCursos = useGetCursosService();

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control, reset } = useForm<FormData>({
    resolver: yupResolver(schema) as never,
  });
  const { errors } = useFormState({ control });

  useEffect(() => {
    let isMounted = true;

    Promise.all([getCursos(), getDisciplina(id)])
      .then(([cursosRes, disciplinaRes]) => {
        if (!isMounted) return;

        if (cursosRes.status === HTTP_CODES_ENUM.OK) {
          setCursos(cursosRes.data);
        }

        if (disciplinaRes.status === HTTP_CODES_ENUM.OK && disciplinaRes.data) {
          reset({
            nome: disciplinaRes.data.nome,
            cursoId: disciplinaRes.data.curso?.id || "",
          });
        } else {
          toast.error("Disciplina não encontrada.");
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
  }, [id, getCursos, getDisciplina, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitting(true);
      const res = await updateDisciplina(id, {
        nome: data.nome,
        curso: { id: data.cursoId },
      });

      if (res.status === HTTP_CODES_ENUM.OK) {
        toast.success("Disciplina atualizada com sucesso!");
        router.push("/admin/disciplinas");
      } else {
        toast.error("Erro ao atualizar disciplina.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar disciplina. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AdminHeader title="Editar Disciplina" />

      <div className="p-6 max-w-[600px] mx-auto w-full">
        <Link
          href="/admin/disciplinas"
          className="inline-flex items-center text-sm font-medium text-[#6f767b] hover:text-[#1c1f21] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para disciplinas
        </Link>

        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl border border-[#e6e5e0]">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a4f8a]" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#e6e5e0] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#f0efea]">
              <h2 className="text-xl font-semibold text-[#1c1f21]">
                Editar disciplina
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
                    <p className="text-sm text-[#a8442f]">
                      {errors.nome.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Curso *</Label>
                  <Controller
                    name="cursoId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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
