import { test, expect } from "@playwright/test";

test.describe("ProofBridge smoke tests", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "ProofBridge" })).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
  });

  test("register page is accessible", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByText(/Get started|शुरू करें/)).toBeVisible();
  });

  test("redirects unauthenticated users from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("/");
    await expect(page.getByRole("heading", { name: "ProofBridge" })).toBeVisible();
  });

  test("theme toggle is present on login page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel(/Toggle theme|थीम बदलें/)).toBeVisible();
  });

  test("language selector is present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel(/Language|भाषा/)).toBeVisible();
  });
});
