import { test, expect, request } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { getLatestEmail } from "../helpers/email.js";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "secret";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

async function loginAsAdmin(page: import("@playwright/test").Page) {
  const ctx = await request.newContext();
  const res = await ctx.post(`${apiUrl}/v1/auth/email/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  expect(res.ok()).toBeTruthy();
  const { token, refreshToken, tokenExpires } = await res.json();

  await page.context().addCookies([
    {
      name: "auth-token-data",
      value: encodeURIComponent(
        JSON.stringify({ token, refreshToken, tokenExpires })
      ),
      url: "http://localhost:3000",
    },
  ]);
}

test.describe("Admin invites a professor / first access", () => {
  test("should create a pending user, not send an email until requested, then let the invited user set a password and get logged in", async ({
    page,
  }) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet
      .email({ provider: "example.com" })
      .toLowerCase();
    const newPassword = "p1ssword";

    await loginAsAdmin(page);

    await page.goto("/admin/usuarios/novo");
    await expect(page).not.toHaveURL(/\/sign-in/);
    await page.getByLabel("Nome *", { exact: true }).fill(firstName);
    await page.getByLabel("Sobrenome *").fill(lastName);
    await page.getByLabel("E-mail *").fill(email);
    await page.getByText("Selecione o papel").click();
    await page.getByRole("option", { name: "Professor" }).click();
    await page.getByRole("button", { name: "Salvar usuário" }).click();

    await page.waitForURL(/\/admin\/usuarios$/);
    const row = page.getByRole("row", { name: new RegExp(email) });
    await expect(row).toBeVisible();
    await expect(row.getByText("Pendente")).toBeVisible();

    // No email should have been sent just from creating the user.
    await expect(getLatestEmail({ targetEmail: email })).rejects.toThrow();

    await row.getByTestId(`send-invite-${email}`).click();
    await expect(
      page.locator("[data-sonner-toast]").filter({ hasText: "Convite enviado" })
    ).toBeVisible();

    const invite = await getLatestEmail({ targetEmail: email });
    const url = invite.text?.split(" ")[0];
    expect(url).toBeTruthy();

    await page.context().clearCookies();
    if (url) {
      await page.goto(url);
    }
    await page.waitForURL(/\/first-access/);

    await page.getByTestId("password").fill(newPassword);
    await page.getByTestId("password-confirmation").fill(newPassword);
    await page.getByTestId("set-first-access-password").click();

    // Auto-login after first access redirects the professor to their area.
    await page.waitForURL(/\/professor\/aulas/);

    // The password set during first access must now work for a normal login.
    const loginCtx = await request.newContext();
    const loginRes = await loginCtx.post(`${apiUrl}/v1/auth/email/login`, {
      data: { email, password: newPassword },
    });
    expect(loginRes.ok()).toBeTruthy();
    const loginBody = await loginRes.json();
    expect(loginBody.token).toBeTruthy();
    expect(loginBody.user.status.id).toBe(1); // active
  });
});
