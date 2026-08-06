import { RoleEnum } from "@/services/api/types/role";

export function getRoleRedirectPath(roleId: number, language: string): string {
  switch (roleId) {
    case RoleEnum.ADMIN:
      return `/${language}/admin`;
    case RoleEnum.ALUNO:
      return `/${language}/aluno/grade`;
    case RoleEnum.PROFESSOR:
      return `/${language}/professor/aulas`;
    case RoleEnum.AUXILIAR_AUDIOVISUAL:
      return `/${language}/auxiliar/solicitacoes`;
    case RoleEnum.LIMPEZA:
      return `/${language}/limpeza/ambientes`;
    case RoleEnum.TECNICO_LABORATORIO:
      return `/${language}/tecnico/patrimonio`;
    default:
      return `/${language}`;
  }
}
