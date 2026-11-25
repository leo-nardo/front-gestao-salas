import { getRoleHome, withLanguage } from "@/routes";

export function getRoleRedirectPath(roleId: number, language: string): string {
  return withLanguage(language, getRoleHome(roleId));
}
