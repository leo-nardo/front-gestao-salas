"use client";

import { useQueryClient } from "@tanstack/react-query";
import { EditDrawer } from "@/components/edit-drawer";
import {
  useGetTipoAmbienteService,
  useUpdateTipoAmbienteService,
  type TipoAmbiente,
} from "@/services/api/services/tipo-ambientes";
import { TipoAmbienteForm } from "./tipoambiente-form";

type TipoAmbienteEditDrawerProps = {
  /** Registro em edição. `null` mantém o drawer fechado. */
  id: string | null;
  onClose: () => void;
};

/** Edição de tipo de ambiente em um drawer, sem sair da lista. */
export function TipoAmbienteEditDrawer({
  id,
  onClose,
}: TipoAmbienteEditDrawerProps) {
  const queryClient = useQueryClient();
  const get = useGetTipoAmbienteService();
  const update = useUpdateTipoAmbienteService();

  return (
    <EditDrawer<TipoAmbiente>
      id={id}
      onClose={onClose}
      title="Editar tipo de ambiente"
      queryKey={(id) => ["tipos-ambiente", id]}
      load={get}
    >
      {(e, { close }) => (
        <TipoAmbienteForm
          variant="drawer"
          title="Editar tipo de ambiente"
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
          successMessage="Tipo de ambiente atualizado com sucesso!"
          defaultValues={{ nome: e.nome || "", descricao: e.descricao || "" }}
          onSave={(data) =>
            update(e.id, {
              nome: data.nome,
              descricao: data.descricao || undefined,
            })
          }
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["tipos-ambiente"] });
            close();
          }}
          onCancel={close}
        />
      )}
    </EditDrawer>
  );
}
