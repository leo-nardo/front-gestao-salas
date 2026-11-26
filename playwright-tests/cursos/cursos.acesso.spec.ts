import { test, expect } from "@playwright/test";
import { routes } from "../../src/routes";

test.describe("Cursos - acesso", () => {
  test("sem sessão, redireciona para o login guardando o retorno", async ({
    page,
  }) => {
    await page.goto(routes.cursos.admin.list());

    await expect(page).toHaveURL(/\/login\?returnTo=/);
    const returnTo = new URL(page.url()).searchParams.get("returnTo");
    expect(returnTo).toMatch(/\/admin\/cursos$/);
  });
});
