import { listRoutes } from "./crud";

/** Agenda de limpeza. A lista de ambientes da limpeza fica em `ambientes.ts`. */
export const agendaRoutes = {
  limpeza: listRoutes("/limpeza/agenda"),
};
