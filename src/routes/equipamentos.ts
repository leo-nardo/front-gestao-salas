import { crudRoutes, listRoutes } from "./crud";

export const equipamentosRoutes = {
  admin: crudRoutes("/admin/equipamentos"),
  professor: crudRoutes("/professor/equipamentos", "nova"),
  auxiliar: listRoutes("/auxiliar/equipamentos"),
};
