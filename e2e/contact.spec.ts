import { test, expect } from '@playwright/test';

// Real end-to-end smoke test for the /contact form (Plan Task #8).
//
// This drives the actual browser + dev server + live API route + real
// Supabase insert (no mocks) — the Vitest suite in
// src/app/api/contact/__tests__/route.test.ts already covers the route's
// logic in isolation with mocked Supabase/fetch; this test instead proves
// the real user-facing flow works end-to-end.
//
// KNOWN DEPENDENCY: this will fail with a 500 / no success UI until the
// `contact_submissions` table exists in the live Supabase project (see
// NIGHTAGENT_REPORT.md, "Bugs Fixed" item 1, for the required schema).
// That is expected and documented — the test is intentionally written for
// when the table exists, not faked to pass without it.
test('submitting the contact form shows the success state', async ({ page }) => {
  await page.goto('/contact');

  await page.getByLabel('Full Name *').fill('Playwright Smoke Test');
  await page.getByLabel('Email Address *').fill('playwright-smoke@example.com');
  await page.getByLabel('Message *').fill('Automated e2e smoke test submission.');

  await page.getByRole('button', { name: 'Book My Demo' }).click();

  await expect(page.getByText('Thanks for reaching out!')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("We'll get back to you within 24 hours.")).toBeVisible();
});
