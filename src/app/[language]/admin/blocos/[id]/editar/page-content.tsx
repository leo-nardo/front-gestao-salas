"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetBlocoService,
  useUpdateBlocoService,
} from "@/services/api/services/blocos";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { BlocoForm, type BlocoFormData } from "../../bloco-form";

export default function PageContent({ id }: { id: string; language: string }) {
  const getBloco = useGetBlocoService();
  const updateBloco = useUpdateBlocoService();

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<BlocoFormData | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;
    getBloco(id)
      .then((res) => {
        if (!isMounted) return;
        if (res.status === HTTP_CODES_ENUM.OK && res.data) {
          setDefaultValues({
            nome: res.data.nome || "",
            descricao: res.data.descricao || "",
          });
        } else {
          toast.error("Bloco não encontrado.");
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) toast.error("Erro ao carregar Bloco.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id, getBloco]);

  return (
    <>
      <AdminHeader title="Editar Bloco" />

      {loading || !defaultValues ? (
        <div className="p-6 max-w-[600px] mx-auto w-full space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <BlocoForm
          title="Editar bloco"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Bloco atualizado com sucesso!"
          defaultValues={defaultValues}
          onSave={(data) =>
            updateBloco(id, {
              nome: data.nome,
              descricao: data.descricao || undefined,
            })
          }
        />
      )}
    </>
  );
}
