import { crudRoutes } from "./crud";

export const cursosRoutes = {
  admin: crudRoutes("/admin/cursos"),
};
