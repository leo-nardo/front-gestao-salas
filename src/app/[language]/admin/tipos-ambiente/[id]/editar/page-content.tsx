"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetTipoAmbienteService,
  useUpdateTipoAmbienteService,
} from "@/services/api/services/tipo-ambientes";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import {
  TipoAmbienteForm,
  type TipoAmbienteFormData,
} from "../../tipoambiente-form";

export default function PageContent({ id }: { id: string; language: string }) {
  const getTipoAmbiente = useGetTipoAmbienteService();
  const updateTipoAmbiente = useUpdateTipoAmbienteService();

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] =
    useState<TipoAmbienteFormData | null>(null);

  useEffect(() => {
    let isMounted = true;
    getTipoAmbiente(id)
      .then((res) => {
        if (!isMounted) return;
        if (res.status === HTTP_CODES_ENUM.OK && res.data) {
          setDefaultValues({
            nome: res.data.nome || "",
            descricao: res.data.descricao || "",
          });
        } else {
          toast.error("Tipo de ambiente não encontrado.");
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) toast.error("Erro ao carregar tipo de ambiente.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id, getTipoAmbiente]);

  return (
    <>
      <AdminHeader title="Editar tipo de ambiente" />

      {loading || !defaultValues ? (
        <div className="p-6 max-w-[600px] mx-auto w-full space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <TipoAmbienteForm
          title="Editar tipo de ambiente"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Tipo de ambiente atualizado com sucesso!"
          defaultValues={defaultValues}
          onSave={(data) =>
            updateTipoAmbiente(id, {
              nome: data.nome,
              descricao: data.descricao || undefined,
            })
          }
        />
      )}
    </>
  );
}
