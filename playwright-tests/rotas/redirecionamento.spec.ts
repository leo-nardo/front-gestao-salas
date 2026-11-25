import { test, expect } from "@playwright/test";
import { routes } from "../../src/routes";
import { apiLogin, ADMIN, loginAsAdmin, setSession } from "../helpers/session";

// Raiz do app, fallbacks de erro/404 e sessão expirada.
test.describe("Rotas - raiz e redirecionamentos", () => {
  test("a raiz sem sessão leva ao login", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/login$/);
  });

  test("a raiz com sessão de admin leva à área do admin", async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto("/");

    await expect(page).toHaveURL(/\/admin(\/ambientes)?$/);
  });

  test("usuário logado em /login volta para a sua área", async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto(routes.auth.login());

    await expect(page).toHaveURL(/\/admin/);
  });
});

test.describe("Rotas - fallbacks", () => {
  test("endereço inexistente mostra a tela 404 com saída para o início", async ({
    page,
  }) => {
    await page.goto("/en/pagina-que-nao-existe");

    await expect(page.getByTestId("not-found")).toBeVisible();
    await expect(page.getByText("Página não encontrada")).toBeVisible();

    await page.getByTestId("not-found-home").click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("endereço inexistente dentro de uma área também mostra o 404", async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto("/en/admin/modulo-que-nao-existe");

    await expect(page.getByTestId("not-found")).toBeVisible();
  });
});

test.describe("Rotas - sessão expirada", () => {
  test("token inválido derruba a sessão e volta ao login", async ({ page }) => {
    const tokens = await apiLogin(ADMIN.email, ADMIN.password);
    await setSession(page, { ...tokens, token: "token-invalido" });

    await page.goto(routes.cursos.admin.list());

    await expect(page).toHaveURL(/\/login/);
  });

  test("sessão invalidada no meio do uso redireciona ao login", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto(routes.cursos.admin.list());
    await expect(
      page.getByRole("heading", { name: "Cursos", exact: true })
    ).toBeVisible();

    // O back passa a recusar qualquer chamada autenticada (401).
    await page.route("**/api/v1/cursos**", (route) =>
      route.fulfill({ status: 401, json: { message: "Unauthorized" } })
    );
    await page.reload();

    await expect(page).toHaveURL(/\/login\?returnTo=/);
  });
});
