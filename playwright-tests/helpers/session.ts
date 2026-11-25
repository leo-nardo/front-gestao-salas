import { expect, request, type Page } from "@playwright/test";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const baseUrl = "http://localhost:3000";

/** Usuário admin criado pela seed do back (api-gestao-salas). */
export const ADMIN = { email: "admin@example.com", password: "secret" };

export type Tokens = {
  token: string;
  refreshToken: string;
  tokenExpires: number;
};

export async function apiLogin(
  email: string,
  password: string
): Promise<Tokens> {
  const ctx = await request.newContext();
  const res = await ctx.post(`${apiUrl}/v1/auth/email/login`, {
    data: { email, password },
  });
  expect(res.ok(), "login via API deve funcionar").toBeTruthy();
  const { token, refreshToken, tokenExpires } = await res.json();
  await ctx.dispose();
  return { token, refreshToken, tokenExpires };
}

/** Injeta a sessão no navegador sem passar pela tela de login. */
export async function setSession(page: Page, tokens: Tokens): Promise<void> {
  await page.context().addCookies([
    {
      name: "auth-token-data",
      value: encodeURIComponent(JSON.stringify(tokens)),
      url: baseUrl,
    },
  ]);
}

export async function loginAs(
  page: Page,
  email: string,
  password: string
): Promise<Tokens> {
  const tokens = await apiLogin(email, password);
  await setSession(page, tokens);
  return tokens;
}

export function loginAsAdmin(page: Page): Promise<Tokens> {
  return loginAs(page, ADMIN.email, ADMIN.password);
}
