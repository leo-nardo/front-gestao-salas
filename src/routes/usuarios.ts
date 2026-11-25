import { crudRoutes } from "./crud";

export const usuariosRoutes = {
  admin: crudRoutes("/admin/usuarios"),
};
