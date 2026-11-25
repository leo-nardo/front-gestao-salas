import { crudRoutes } from "./crud";

export const turmasRoutes = {
  admin: crudRoutes("/admin/turmas", "nova"),
};
