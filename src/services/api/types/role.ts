export enum RoleEnum {
  ADMIN = 1,
  USER = 2,
  AUXILIAR_AUDIOVISUAL = 3,
  LIMPEZA = 4,
  TECNICO_LABORATORIO = 5,
  PROFESSOR = 6,
  ALUNO = 7,
}

export type Role = {
  id: number | string;
  name?: string;
};
