"use client";

import { useQueryClient } from "@tanstack/react-query";
import { EditDrawer } from "@/components/edit-drawer";
import {
  useGetBlocoService,
  useUpdateBlocoService,
  type Bloco,
} from "@/services/api/services/blocos";
import { BlocoForm } from "./bloco-form";

type BlocoEditDrawerProps = {
  /** Registro em edição. `null` mantém o drawer fechado. */
  id: string | null;
  onClose: () => void;
};

/** Edição de bloco em um drawer, sem sair da lista. */
export function BlocoEditDrawer({ id, onClose }: BlocoEditDrawerProps) {
  const queryClient = useQueryClient();
  const get = useGetBlocoService();
  const update = useUpdateBlocoService();

  return (
    <EditDrawer<Bloco>
      id={id}
      onClose={onClose}
      title="Editar bloco"
      queryKey={(id) => ["blocos", id]}
      load={get}
    >
      {(e, { close }) => (
        <BlocoForm
          variant="drawer"
          title="Editar bloco"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Bloco atualizado com sucesso!"
          defaultValues={{ nome: e.nome || "", descricao: e.descricao || "" }}
          onSave={(data) =>
            update(e.id, {
              nome: data.nome,
              descricao: data.descricao || undefined,
            })
          }
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["blocos"] });
            close();
          }}
          onCancel={close}
        />
      )}
    </EditDrawer>
  );
}
