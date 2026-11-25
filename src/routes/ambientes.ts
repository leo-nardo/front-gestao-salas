import { crudRoutes, listRoutes } from "./crud";

export const ambientesRoutes = {
  admin: crudRoutes("/admin/ambientes"),
  limpeza: listRoutes("/limpeza/ambientes"),
};
