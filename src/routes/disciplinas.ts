import { crudRoutes } from "./crud";

export const disciplinasRoutes = {
  admin: crudRoutes("/admin/disciplinas", "nova"),
};
