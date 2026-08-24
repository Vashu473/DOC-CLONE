# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> checklist 1-8 browser flows >> import txt/md and reject pdf + empty file
- Location: e2e\app.spec.ts:77:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Unsupported file type/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/Unsupported file type/i)

```

```yaml
- banner:
  - img "Ajaia LLC"
  - text: Docs
  - paragraph: Alice Sharma alice@ajaia.dev
  - button "Log out"
- main:
  - heading "Documents" [level=1]
  - paragraph: Owned docs are yours. Shared with me is access granted by another user.
  - button "New document"
  - text: Import .txt / .md
  - paragraph:
    - text: "Supported import:"
    - strong: .txt
    - text: and
    - strong: .md
    - text: (max 1 MB). Word
    - strong: .docx
    - text: is not supported in this slice.
  - link "Owned (5)":
    - /url: /docs
  - link "Shared with me (0)":
    - /url: /docs?tab=shared
  - list:
    - listitem:
      - link "notes":
        - /url: /docs/cmt7dk0e10007fkk0ua6n9b2u
      - paragraph: Owner Alice Sharma · 8/24/2026, 8:42:09 PM
      - button "Rename"
      - button "Delete"
    - listitem:
      - link "notes":
        - /url: /docs/cmt7dk02e0005fkk0nupzzqr1
      - paragraph: Owner Alice Sharma · 8/24/2026, 8:42:09 PM
      - button "Rename"
      - button "Delete"
    - listitem:
      - link "Untitled document":
        - /url: /docs/cmt7djr1x0003fkk0b9fyw6p6
      - paragraph: Owner Alice Sharma · 8/24/2026, 8:41:57 PM
      - button "Rename"
      - button "Delete"
    - listitem:
      - link "QA 1787584316423":
        - /url: /docs/cmt7djopq0001fkk0t8qqxum3
      - paragraph: Owner Alice Sharma · 8/24/2026, 8:41:56 PM
      - button "Rename"
      - button "Delete"
    - listitem:
      - link "Welcome to Ajaia Docs":
        - /url: /docs/cmt7cm81l0003fkqotwdhiggz
      - paragraph: Owner Alice Sharma · 8/24/2026, 8:15:53 PM
      - button "Rename"
      - button "Delete"
- alert
```

# Test source

```ts
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | import path from "path";
  3   | 
  4   | const alice = { email: "alice@ajaia.dev", password: "demo1234" };
  5   | const bob = { email: "bob@ajaia.dev", password: "demo1234" };
  6   | const carol = { email: "carol@ajaia.dev", password: "demo1234" };
  7   | 
  8   | async function login(page: Page, user: { email: string; password: string }) {
  9   |   await page.goto("/login");
  10  |   await page.locator('input[name="email"]').fill(user.email);
  11  |   await page.locator('input[name="password"]').fill(user.password);
  12  |   await page.getByRole("button", { name: "Sign in" }).click();
  13  |   await expect(page).toHaveURL(/\/docs/);
  14  | }
  15  | 
  16  | async function logout(page: Page) {
  17  |   await page.getByRole("button", { name: "Log out" }).click();
  18  |   await expect(page).toHaveURL(/\/login/);
  19  | }
  20  | 
  21  | test.describe("checklist 1-8 browser flows", () => {
  22  |   test("app loads login without crashing", async ({ page }) => {
  23  |     const errors: string[] = [];
  24  |     page.on("pageerror", (err) => errors.push(err.message));
  25  |     await page.goto("/login");
  26  |     await expect(page.getByRole("heading", { name: "Ajaia Docs" })).toBeVisible();
  27  |     await expect(page.getByText("alice@ajaia.dev")).toBeVisible();
  28  |     expect(errors).toEqual([]);
  29  |   });
  30  | 
  31  |   test("unauthenticated /docs redirects to login", async ({ page }) => {
  32  |     await page.goto("/docs");
  33  |     await expect(page).toHaveURL(/\/login/);
  34  |   });
  35  | 
  36  |   test("Alice and Bob can both log in", async ({ page }) => {
  37  |     await login(page, alice);
  38  |     await expect(page.getByRole("heading", { name: "Documents" })).toBeVisible();
  39  |     await logout(page);
  40  |     await login(page, bob);
  41  |     await expect(page.getByRole("heading", { name: "Documents" })).toBeVisible();
  42  |   });
  43  | 
  44  |   test("create untitled doc, rename, persist after reopen", async ({ page }) => {
  45  |     await login(page, alice);
  46  |     await page.getByRole("button", { name: "New document" }).click();
  47  |     await expect(page).toHaveURL(/\/docs\/.+/);
  48  |     await expect(page.getByLabel("Document title")).toHaveValue(
  49  |       "Untitled document",
  50  |     );
  51  |     const title = `QA ${Date.now()}`;
  52  |     await page.getByLabel("Document title").fill(title);
  53  |     await page.getByLabel("Document title").blur();
  54  |     await page.getByRole("button", { name: "Save now" }).click();
  55  |     await expect(page.getByText("Saved")).toBeVisible({ timeout: 10_000 });
  56  |     await page.goto("/docs");
  57  |     await expect(page.getByRole("link", { name: title })).toBeVisible();
  58  |     await page.getByRole("link", { name: title }).click();
  59  |     await expect(page.getByLabel("Document title")).toHaveValue(title);
  60  |   });
  61  | 
  62  |   test("rich text toolbar applies heading and lists then persists", async ({
  63  |     page,
  64  |   }) => {
  65  |     await login(page, alice);
  66  |     await page.getByRole("button", { name: "New document" }).click();
  67  |     const editor = page.locator(".tiptap");
  68  |     await editor.click();
  69  |     await page.keyboard.type("Persist me");
  70  |     await page.getByRole("button", { name: "H1" }).click();
  71  |     await page.getByRole("button", { name: "Save now" }).click();
  72  |     await expect(page.getByText("Saved")).toBeVisible({ timeout: 10_000 });
  73  |     await page.reload();
  74  |     await expect(page.locator(".tiptap")).toContainText("Persist me");
  75  |   });
  76  | 
  77  |   test("import txt/md and reject pdf + empty file", async ({ page }) => {
  78  |     await login(page, alice);
  79  |     const fixtures = path.join(process.cwd(), "tests", "fixtures");
  80  | 
  81  |     await page.locator('input[type="file"]').setInputFiles(
  82  |       path.join(fixtures, "notes.txt"),
  83  |     );
  84  |     await expect(page).toHaveURL(/\/docs\/.+/, { timeout: 15_000 });
  85  |     await expect(page.locator(".tiptap")).toContainText("hello from txt import");
  86  | 
  87  |     await page.goto("/docs");
  88  |     await page.locator('input[type="file"]').setInputFiles(
  89  |       path.join(fixtures, "notes.md"),
  90  |     );
  91  |     await expect(page).toHaveURL(/\/docs\/.+/, { timeout: 15_000 });
  92  |     await expect(page.getByLabel("Document title")).toHaveValue("notes");
  93  | 
  94  |     await page.goto("/docs");
  95  |     await page.locator('input[type="file"]').setInputFiles(
  96  |       path.join(fixtures, "fake.pdf"),
  97  |     );
> 98  |     await expect(page.getByText(/Unsupported file type/i)).toBeVisible();
      |                                                            ^ Error: expect(locator).toBeVisible() failed
  99  | 
  100 |     await page.locator('input[type="file"]').setInputFiles(
  101 |       path.join(fixtures, "empty.txt"),
  102 |     );
  103 |     await expect(page.getByText(/Choose a \.txt or \.md/i)).toBeVisible();
  104 |   });
  105 | 
  106 |   test("share with Bob; Carol cannot open the URL", async ({ page }) => {
  107 |     await login(page, alice);
  108 |     await page.getByRole("button", { name: "New document" }).click();
  109 |     const title = `Share QA ${Date.now()}`;
  110 |     await page.getByLabel("Document title").fill(title);
  111 |     await page.getByLabel("Document title").blur();
  112 |     const docUrl = page.url();
  113 | 
  114 |     await page.getByRole("button", { name: "Share" }).click();
  115 |     await page.locator('input[type="email"]').fill("nobody@ajaia.dev");
  116 |     await page.getByRole("button", { name: "Grant" }).click();
  117 |     await expect(page.getByText(/User not found/i)).toBeVisible();
  118 | 
  119 |     await page.locator('input[type="email"]').fill(bob.email);
  120 |     await page.getByRole("button", { name: "Grant" }).click();
  121 |     await expect(page.getByText("Access granted.")).toBeVisible();
  122 |     await page.getByRole("button", { name: "Grant" }).click();
  123 |     await expect(page.getByText("Access granted.")).toBeVisible();
  124 |     await page.getByRole("button", { name: "Close" }).click();
  125 | 
  126 |     await logout(page);
  127 |     await login(page, bob);
  128 |     await page.getByRole("link", { name: /Shared with me/ }).click();
  129 |     await expect(page.getByRole("link", { name: title })).toBeVisible();
  130 |     await page.getByRole("link", { name: title }).click();
  131 |     await expect(page.getByText(/shared with you/i)).toBeVisible();
  132 | 
  133 |     await logout(page);
  134 |     await login(page, carol);
  135 |     await page.goto(docUrl);
  136 |     await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
  137 |   });
  138 | 
  139 |   test("invalid document id shows not found", async ({ page }) => {
  140 |     await login(page, alice);
  141 |     await page.goto("/docs/this-id-does-not-exist");
  142 |     await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
  143 |   });
  144 | });
  145 | 
```