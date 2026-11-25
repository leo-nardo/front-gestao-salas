import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { routes } from "../../src/routes";
import { apiDeleteCursosComPrefixo } from "../helpers/cursos-api";
import { loginAsAdmin } from "../helpers/session";

// Fluxo completo de CRUD do módulo Cursos (perfil admin).
test.describe("Cursos - CRUD", () => {
  test.describe.configure({ mode: "serial" });

  const PREFIXO = "Curso E2E ";
  const nome = `${PREFIXO}${faker.string.alphanumeric(8)}`;
  const nomeEditado = `${nome} (editado)`;

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  // Se algum passo falhar no meio do fluxo, não deixa o curso no banco.
  test.afterAll(async () => {
    await apiDeleteCursosComPrefixo(PREFIXO);
  });

  test("lista os cursos para o admin", async ({ page }) => {
    await page.goto(routes.cursos.admin.list());

    await expect(
      page.getByRole("heading", { name: "Cursos", exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Novo curso" })
    ).toBeVisible();
  });

  test("valida o nome obrigatório ao criar", async ({ page }) => {
    await page.goto(routes.cursos.admin.create());

    await page.getByRole("button", { name: "Cadastrar curso" }).click();

    await expect(page.getByText("O nome é obrigatório")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/cursos\/novo$/);
  });

  test("cria um curso", async ({ page }) => {
    await page.goto(routes.cursos.admin.list());
    await page.getByRole("button", { name: "Novo curso" }).click();
    await expect(page).toHaveURL(/\/admin\/cursos\/novo$/);

    await page.getByLabel("Nome *").fill(nome);
    await page.getByRole("button", { name: "Cadastrar curso" }).click();

    await expect(page.getByText("Curso cadastrado com sucesso!")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/cursos$/);
    await expect(
      page.getByRole("cell", { name: nome, exact: true })
    ).toBeVisible();
  });

  test("edita o curso criado", async ({ page }) => {
    await page.goto(routes.cursos.admin.list());
    const linha = page.getByRole("row", { name: new RegExp(nome) });
    await linha.getByRole("link", { name: "Editar" }).click();
    await expect(page).toHaveURL(/\/admin\/cursos\/.+\/editar$/);

    const campo = page.getByLabel("Nome *");
    await expect(campo).toHaveValue(nome);
    await campo.fill(nomeEditado);
    await page.getByRole("button", { name: /Salvar/ }).click();

    await expect(page).toHaveURL(/\/admin\/cursos$/);
    await expect(
      page.getByRole("cell", { name: nomeEditado, exact: true })
    ).toBeVisible();
  });

  test("busca o curso pelo nome", async ({ page }) => {
    await page.goto(routes.cursos.admin.list());

    await page.getByPlaceholder("Buscar por nome...").fill(nomeEditado);

    await expect(
      page.getByRole("cell", { name: nomeEditado, exact: true })
    ).toBeVisible();
  });

  test("cancela e depois confirma a exclusão", async ({ page }) => {
    await page.goto(routes.cursos.admin.list());
    await page.getByPlaceholder("Buscar por nome...").fill(nomeEditado);
    // string (não RegExp): o nome tem parênteses
    const linha = page.getByRole("row", { name: nomeEditado });
    const dialogo = page.getByRole("alertdialog");

    await linha.getByRole("button", { name: "Excluir" }).click();
    await dialogo.getByRole("button", { name: "Cancelar" }).click();
    await expect(linha).toBeVisible();

    await linha.getByRole("button", { name: "Excluir" }).click();
    await dialogo.getByRole("button", { name: "Excluir" }).click();

    await expect(page.getByText("Curso excluído com sucesso!")).toBeVisible();
    await expect(
      page.getByRole("cell", { name: nomeEditado, exact: true })
    ).toHaveCount(0);
  });
});
