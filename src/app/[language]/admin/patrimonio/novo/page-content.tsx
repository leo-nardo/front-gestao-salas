"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AdminHeader } from "@/components/admin-header";
import { useCreateItemPatrimonialService } from "@/services/api/services/item-patrimonials";
import { PatrimonioForm } from "../patrimonio-form";

export default function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultAmbiente = searchParams.get("ambiente");
  const backHref = `/admin/patrimonio${defaultAmbiente ? `?ambiente=${defaultAmbiente}` : ""}`;

  const createItem = useCreateItemPatrimonialService();

  return (
    <>
      <AdminHeader title="Novo Item Patrimonial" />
      <PatrimonioForm
        title="Cadastrar item"
        submitLabel="Cadastrar item"
        submittingLabel="Salvando..."
        successMessage="Item patrimonial cadastrado com sucesso!"
        backHref={backHref}
        defaultValues={{ ambienteId: defaultAmbiente || "" }}
        onSave={(data) =>
          createItem({
            nome: data.nome,
            tipo: data.tipo,
            ambiente: { id: data.ambienteId },
            numeroPatrimonio: data.numeroPatrimonio || undefined,
            estado: data.estado,
          })
        }
        onSaved={() => router.push(backHref)}
      />
    </>
  );
}
