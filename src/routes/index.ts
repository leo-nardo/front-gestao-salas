import { RoleEnum } from "@/services/api/types/role";
import { agendaRoutes } from "./agenda";
import { ambientesRoutes } from "./ambientes";
import { andaresRoutes } from "./andares";
import { aulasRoutes } from "./aulas";
import { authRoutes, profileRoutes, publicRoutes } from "./auth";
import { blocosRoutes } from "./blocos";
import { cursosRoutes } from "./cursos";
import { disciplinasRoutes } from "./disciplinas";
import { ensalamentoRoutes } from "./ensalamento";
import { equipamentosRoutes } from "./equipamentos";
import { eventosRoutes } from "./eventos";
import { gradeRoutes } from "./grade";
import { patrimonioRoutes } from "./patrimonio";
import { reservasRoutes } from "./reservas";
import { solicitacoesRoutes } from "./solicitacoes";
import { solicitacoesEquipamentoRoutes } from "./solicitacoes-equipamento";
import { tiposAmbienteRoutes } from "./tipos-ambiente";
import { turmasRoutes } from "./turmas";
import { usuariosRoutes } from "./usuarios";

export { withQuery } from "./crud";

/** Página inicial de cada perfil (para onde o login e os índices redirecionam). */
export const homeRoutes = {
  admin: () => "/admin",
  aluno: () => gradeRoutes.aluno.list(),
  professor: () => aulasRoutes.professor.list(),
  auxiliar: () => solicitacoesRoutes.auxiliar.list(),
  limpeza: () => ambientesRoutes.limpeza.list(),
  tecnico: () => patrimonioRoutes.tecnico.list(),
};

/**
 * Fonte única dos paths do app. Cada módulo vive no seu arquivo e expõe uma
 * chave por perfil que o consome (ex.: `routes.reservas.admin.create()`).
 * Os paths não levam prefixo de idioma.
 */
export const routes = {
  home: homeRoutes,
  auth: authRoutes,
  profile: profileRoutes,
  public: publicRoutes,
  ambientes: ambientesRoutes,
  tiposAmbiente: tiposAmbienteRoutes,
  blocos: blocosRoutes,
  andares: andaresRoutes,
  patrimonio: patrimonioRoutes,
  equipamentos: equipamentosRoutes,
  cursos: cursosRoutes,
  disciplinas: disciplinasRoutes,
  turmas: turmasRoutes,
  aulas: aulasRoutes,
  reservas: reservasRoutes,
  solicitacoes: solicitacoesRoutes,
  solicitacoesEquipamento: solicitacoesEquipamentoRoutes,
  usuarios: usuariosRoutes,
  ensalamento: ensalamentoRoutes,
  grade: gradeRoutes,
  eventos: eventosRoutes,
  agenda: agendaRoutes,
};

/** Prefixa o idioma: `withLanguage("pt", "/admin")` -> `/pt/admin`. */
export function withLanguage(language: string, path: string): string {
  return path === "/" ? `/${language}` : `/${language}${path}`;
}

/** Path (sem idioma) da página inicial do perfil, ou "/" se não houver. */
export function getRoleHome(roleId: number): string {
  switch (roleId) {
    case RoleEnum.ADMIN:
      return homeRoutes.admin();
    case RoleEnum.ALUNO:
      return homeRoutes.aluno();
    case RoleEnum.PROFESSOR:
      return homeRoutes.professor();
    case RoleEnum.AUXILIAR_AUDIOVISUAL:
      return homeRoutes.auxiliar();
    case RoleEnum.LIMPEZA:
      return homeRoutes.limpeza();
    case RoleEnum.TECNICO_LABORATORIO:
      return homeRoutes.tecnico();
    default:
      return "/";
  }
}
