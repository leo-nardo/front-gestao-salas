import { crudRoutes, listRoutes } from "./crud";

/** Solicitações de troca de sala. */
export const solicitacoesRoutes = {
  admin: listRoutes("/admin/solicitacoes"),
  auxiliar: crudRoutes("/auxiliar/solicitacoes", "nova"),
};
