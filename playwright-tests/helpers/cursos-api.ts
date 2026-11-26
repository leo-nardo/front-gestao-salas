import { request } from "@playwright/test";
import { ADMIN, apiLogin } from "./session";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Remove via API os cursos criados pelo e2e (nome começando com `prefixo`),
 * para não deixar lixo no banco quando um teste falha no meio do fluxo.
 */
export async function apiDeleteCursosComPrefixo(prefixo: string) {
  const { token } = await apiLogin(ADMIN.email, ADMIN.password);
  const ctx = await request.newContext({
    extraHTTPHeaders: { Authorization: `Bearer ${token}` },
  });

  const res = await ctx.get(`${apiUrl}/v1/cursos?limit=500`);
  if (res.ok()) {
    const cursos: { id: string; nome: string }[] = await res.json();
    for (const curso of cursos.filter((c) => c.nome.startsWith(prefixo))) {
      await ctx.delete(`${apiUrl}/v1/cursos/${curso.id}`);
    }
  }

  await ctx.dispose();
}
