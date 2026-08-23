"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetCursoService,
  useUpdateCursoService,
} from "@/services/api/services/cursos";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { CursoForm, type CursoFormData } from "../../curso-form";

export default function PageContent({ id }: { id: string }) {
  const getCurso = useGetCursoService();
  const updateCurso = useUpdateCursoService();

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<CursoFormData | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;
    getCurso(id)
      .then((res) => {
        if (!isMounted) return;
        if (res.status === HTTP_CODES_ENUM.OK && res.data) {
          setDefaultValues({ nome: res.data.nome || "" });
        } else {
          toast.error("Curso não encontrado.");
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) toast.error("Erro ao carregar curso.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id, getCurso]);

  return (
    <>
      <AdminHeader title="Editar Curso" />

      {loading || !defaultValues ? (
        <div className="p-6 max-w-[600px] mx-auto w-full space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <CursoForm
          title="Editar curso"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Curso atualizado com sucesso!"
          defaultValues={defaultValues}
          onSave={(data) => updateCurso(id, { nome: data.nome })}
        />
      )}
    </>
  );
}
