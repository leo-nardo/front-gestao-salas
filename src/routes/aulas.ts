import { crudRoutes, listRoutes } from "./crud";

export const aulasRoutes = {
  admin: crudRoutes("/admin/aulas", "nova"),
  professor: listRoutes("/professor/aulas"),
};
