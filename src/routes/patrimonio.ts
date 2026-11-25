import { crudRoutes, listRoutes } from "./crud";

export const patrimonioRoutes = {
  admin: crudRoutes("/admin/patrimonio"),
  tecnico: listRoutes("/tecnico/patrimonio"),
};
