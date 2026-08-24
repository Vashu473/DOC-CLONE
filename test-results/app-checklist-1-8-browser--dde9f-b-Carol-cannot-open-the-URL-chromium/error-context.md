# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> checklist 1-8 browser flows >> share with Bob; Carol cannot open the URL
- Location: e2e\app.spec.ts:106:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/shared with you/i)
Expected: visible
Error: strict mode violation: getByText(/shared with you/i) resolved to 2 elements:
    1) <p class="mt-1 text-sm text-stone-500">…</p> aka getByText('Owner Alice Sharma (alice@')
    2) <p class="text-xs text-stone-500">Shared with you as an editor. Only the owner can …</p> aka getByText('Shared with you as an editor')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/shared with you/i)

```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - button "Open Next.js Dev Tools" [ref=f1e7] [cursor=pointer]
  - alert [ref=f1e11]: Ajaia Docs
  - generic [ref=f1e12]:
    - banner [ref=f1e13]:
      - generic [ref=f1e14]:
        - img "Ajaia LLC" [ref=f1e15]
        - generic [ref=f1e16]: Docs
      - generic [ref=f1e17]:
        - paragraph [ref=f1e18]:
          - text: Bob Mensah
          - generic [ref=f1e19]: bob@ajaia.dev
        - button "Log out" [ref=f1e21]
    - main [ref=f1e23]:
      - link "← All documents" [ref=f1e24] [cursor=pointer]:
        - /url: /docs
      - generic [ref=f1e25]:
        - generic [ref=f1e26]:
          - textbox "Document title" [ref=f1e27]: Share QA 1787584336362
          - paragraph [ref=f1e28]: Owner Alice Sharma (alice@ajaia.dev) · shared with you
        - paragraph [ref=f1e29]: Shared with you as an editor. Only the owner can change access.
      - generic [ref=f1e31]:
        - generic [ref=f1e32]:
          - paragraph [ref=f1e33]: Saved
          - button "Save now" [ref=f1e34]
        - generic [ref=f1e35]:
          - generic [ref=f1e36]:
            - button "Bold" [ref=f1e37]
            - button "Italic" [ref=f1e38]
            - button "Underline" [ref=f1e39]
            - button "H1" [ref=f1e41]
            - button "H2" [ref=f1e42]
            - button "Body" [ref=f1e43]
            - button "Bullets" [ref=f1e45]
            - button "Numbers" [ref=f1e46]
          - generic [ref=f1e47]:
            - paragraph [ref=f1e48]: Editing Share QA 1787584336362
            - paragraph [ref=f1e51]: Start writing…
```

# Test source

```ts
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
  98  |     await expect(page.getByText(/Unsupported file type/i)).toBeVisible();
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
> 131 |     await expect(page.getByText(/shared with you/i)).toBeVisible();
      |                                                      ^ Error: expect(locator).toBeVisible() failed
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