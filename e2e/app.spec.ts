import { expect, test, type Page } from "@playwright/test";

const alice = { email: "alice@ajaia.dev", password: "demo1234" };
const bob = { email: "bob@ajaia.dev", password: "demo1234" };

async function login(page: Page, user: { email: string; password: string }) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(user.email);
  await page.locator('input[name="password"]').fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/docs/, { timeout: 15_000 });
}

test.describe("stable smoke", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Ajaia Docs" })).toBeVisible();
  });

  test("/docs redirects when logged out", async ({ page }) => {
    await page.goto("/docs");
    await expect(page).toHaveURL(/\/login/);
  });

  test("Alice and Bob can log in", async ({ page }) => {
    await login(page, alice);
    await expect(page.getByRole("heading", { name: "Documents" })).toBeVisible();
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login/);
    await login(page, bob);
    await expect(page.getByRole("heading", { name: "Documents" })).toBeVisible();
  });

  test("create document with default title", async ({ page }) => {
    await login(page, alice);
    await page.getByRole("button", { name: "New document" }).click();
    await expect(page).toHaveURL(/\/docs\/.+/);
    await expect(page.getByLabel("Document title")).toHaveValue(
      "Untitled document",
    );
  });

  test("unknown document id shows not found", async ({ page }) => {
    await login(page, alice);
    await page.goto("/docs/this-id-does-not-exist");
    await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
  });
});
