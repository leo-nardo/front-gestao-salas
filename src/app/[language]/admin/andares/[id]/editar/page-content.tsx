"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetAndarService,
  useUpdateAndarService,
} from "@/services/api/services/andares";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { AndarForm, type AndarFormData } from "../../andar-form";

export default function PageContent({ id }: { id: string; language: string }) {
  const getAndar = useGetAndarService();
  const updateAndar = useUpdateAndarService();

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<AndarFormData | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;
    getAndar(id)
      .then((res) => {
        if (!isMounted) return;
        if (res.status === HTTP_CODES_ENUM.OK && res.data) {
          setDefaultValues({
            nome: res.data.nome || "",
            descricao: res.data.descricao || "",
          });
        } else {
          toast.error("Andar não encontrado.");
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) toast.error("Erro ao carregar Andar.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id, getAndar]);

  return (
    <>
      <AdminHeader title="Editar Andar" />

      {loading || !defaultValues ? (
        <div className="p-6 max-w-[600px] mx-auto w-full space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <AndarForm
          title="Editar andar"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Andar atualizado com sucesso!"
          defaultValues={defaultValues}
          onSave={(data) =>
            updateAndar(id, {
              nome: data.nome,
              descricao: data.descricao || undefined,
            })
          }
        />
      )}
    </>
  );
}
