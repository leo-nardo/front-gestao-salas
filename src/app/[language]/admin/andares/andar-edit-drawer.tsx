"use client";

import { useQueryClient } from "@tanstack/react-query";
import { EditDrawer } from "@/components/edit-drawer";
import {
  useGetAndarService,
  useUpdateAndarService,
  type Andar,
} from "@/services/api/services/andares";
import { AndarForm } from "./andar-form";

type AndarEditDrawerProps = {
  /** Registro em edição. `null` mantém o drawer fechado. */
  id: string | null;
  onClose: () => void;
};

/** Edição de andar em um drawer, sem sair da lista. */
export function AndarEditDrawer({ id, onClose }: AndarEditDrawerProps) {
  const queryClient = useQueryClient();
  const get = useGetAndarService();
  const update = useUpdateAndarService();

  return (
    <EditDrawer<Andar>
      id={id}
      onClose={onClose}
      title="Editar andar"
      queryKey={(id) => ["andares", id]}
      load={get}
    >
      {(e, { close }) => (
        <AndarForm
          variant="drawer"
          title="Editar andar"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Andar atualizado com sucesso!"
          defaultValues={{ nome: e.nome || "", descricao: e.descricao || "" }}
          onSave={(data) =>
            update(e.id, {
              nome: data.nome,
              descricao: data.descricao || undefined,
            })
          }
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["andares"] });
            close();
          }}
          onCancel={close}
        />
      )}
    </EditDrawer>
  );
}
