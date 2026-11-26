import { crudRoutes } from "./crud";

export const reservasRoutes = {
  admin: crudRoutes("/admin/reservas", "nova"),
  professor: crudRoutes("/professor/reservas", "nova"),
};
