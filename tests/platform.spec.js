import { test, expect } from "@playwright/test";

test("desktop: quests, logging, skills, goals, assistant, and persistence", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Keep becoming, Alex." }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/dashboard-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page
    .getByRole("button", {
      name: "Complete Solve one algorithm problem",
      exact: true,
    })
    .click();
  await expect(page.getByRole("status")).toContainText("A little progress");
  await expect(
    page.getByRole("button", {
      name: "Complete Solve one algorithm problem",
      exact: true,
    }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Log progress", exact: true }).click();
  await page
    .getByLabel("Your progress", { exact: true })
    .fill("Practiced English for 40 minutes");
  await page
    .getByRole("button", { name: "Review progress", exact: true })
    .click();
  await expect(page.getByLabel("Reward XP", { exact: true })).toHaveValue("50");
  await page.getByLabel("Reward XP", { exact: true }).fill("55");
  await page
    .getByRole("button", { name: "Confirm progress", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Skills", exact: true }).click();
  await page.getByRole("button", { name: "Add skill", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("Woodworking");
  await page.getByLabel("Starting level", { exact: true }).fill("4");
  await page.getByRole("button", { name: "Save skill", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Woodworking", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Goals", exact: true }).click();
  await page.getByRole("button", { name: "Set a goal", exact: true }).click();
  await page.getByLabel("Your goal", { exact: true }).fill("Learn piano");
  await page
    .getByRole("button", { name: "Suggest roadmap", exact: true })
    .click();
  await page.getByRole("button", { name: "Create goal", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Learn piano", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Toggle Learn posture and basic notation",
      exact: true,
    })
    .click();
  await expect(page.getByRole("status")).toContainText("Milestone reached");
  await page
    .getByRole("button", { name: "AI Assistant NEW", exact: true })
    .click();
  await page
    .getByLabel("Message your assistant")
    .fill("Create a 7-day plan for English");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator(".message-content").last()).toContainText(
    "sustainable 7-day plan",
  );
  await page.getByRole("button", { name: "Review & add quest" }).click();
  await page.getByRole("button", { name: "Create quest", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".message-content").last()).toContainText(
    "sustainable 7-day plan",
  );
  for (const name of [
    "Quests",
    "Stats",
    "Analytics",
    "Timeline",
    "Achievements",
    "Settings",
  ]) {
    await page
      .locator(".sidebar")
      .getByRole("button", { name, exact: true })
      .click();
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  }
  await page.getByLabel("Daily development time (minutes)").fill("45");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByRole("status")).toContainText("Preferences saved");
  await page.reload();
  await expect(page.getByLabel("Daily development time (minutes)")).toHaveValue(
    "45",
  );
  expect(errors).toEqual([]);
});

test("mobile: responsive navigation and initial assessment", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Keep becoming, Alex." }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/dashboard-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Stats", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "A more balanced you." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Dashboard", exact: true }).click();
  await page
    .getByRole("button", { name: /Demo workspace Make it yours/ })
    .click();
  await page.getByLabel("What should we call you?").fill("Daniyal");
  await page
    .getByLabel("Your most important goal")
    .fill("Build a personal application");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Skills you already practice")
    .fill("Programming, English");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Create my starting point", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Keep becoming, Daniyal." }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Keep becoming, Daniyal." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});

test("accounts: registration, assessment, sign out and sign in", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page
    .getByRole("button", { name: "New here? Create an account" })
    .click();
  await page.getByLabel("Your name", { exact: true }).fill("Taylor");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("taylor@example.test");
  await page.getByLabel("Password", { exact: true }).fill("test-password-123");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page.getByLabel("What should we call you?")).toHaveValue(
    "Taylor",
  );
  await page
    .getByLabel("Your most important goal")
    .fill("Learn a new language");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Skills you already practice").fill("English, Piano");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Create my starting point", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Keep becoming, Taylor." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(
    page.getByText("taylor@example.test", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page
    .getByLabel("Email address", { exact: true })
    .fill("taylor@example.test");
  await page.getByLabel("Password", { exact: true }).fill("test-password-123");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Sign in", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByText("taylor@example.test", { exact: true }),
  ).toBeVisible();
});
