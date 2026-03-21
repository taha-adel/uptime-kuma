import { expect, test } from "@playwright/test";
import { login, restoreSqliteSnapshot, screenshot } from "../util-test";

test.describe("Incident History", () => {
    test.beforeEach(async ({ page }) => {
        await restoreSqliteSnapshot(page);
    });

    test("past incidents section is hidden when no incidents exist", async ({ page }, testInfo) => {
        test.setTimeout(60000);

        await page.goto("./add");
        await login(page);
        await expect(page.getByTestId("monitor-type-select")).toBeVisible();

        await page.goto("./add-status-page");
        await page.getByTestId("name-input").fill("Empty Test");
        await page.getByTestId("slug-input").fill("empty-test");
        await page.getByTestId("submit-button").click();
        await page.waitForURL("/status/empty-test?edit");

        await page.getByTestId("save-button").click();
        await expect(page.getByTestId("edit-sidebar")).toHaveCount(0);

        // No incident history link should appear when there are no incidents
        const historyLink = page.locator("a[href='/status/empty-test/incidents']");
        await expect(historyLink).toHaveCount(0);

        await screenshot(testInfo, page);
    });

    test("active pinned incidents are shown at top and not in past incidents", async ({ page }, testInfo) => {
        test.setTimeout(60000);

        await page.goto("./add");
        await login(page);
        await expect(page.getByTestId("monitor-type-select")).toBeVisible();

        await page.goto("./add-status-page");
        await page.getByTestId("name-input").fill("Dedup Test");
        await page.getByTestId("slug-input").fill("dedup-test");
        await page.getByTestId("submit-button").click();
        await page.waitForURL("/status/dedup-test?edit");

        await page.getByTestId("create-incident-button").click();
        await page.getByTestId("incident-title").fill("Active Incident");
        await page.getByTestId("post-incident-button").click();

        await page.waitForTimeout(500);

        await page.getByTestId("save-button").click();
        await expect(page.getByTestId("edit-sidebar")).toHaveCount(0);

        const activeIncident = page.getByTestId("incident").filter({ hasText: "Active Incident" });
        await expect(activeIncident).toBeVisible();

        // Active (pinned) incidents should not cause an incident history link to appear
        const historyLink = page.locator("a[href='/status/dedup-test/incidents']");
        await expect(historyLink).toHaveCount(0);

        await screenshot(testInfo, page);
    });

    test("resolved incidents appear in past incidents section", async ({ page }, testInfo) => {
        test.setTimeout(120000);

        await page.goto("./add");
        await login(page);
        await expect(page.getByTestId("monitor-type-select")).toBeVisible();

        await page.goto("./add-status-page");
        await page.getByTestId("name-input").fill("Resolve Test");
        await page.getByTestId("slug-input").fill("resolve-test");
        await page.getByTestId("submit-button").click();
        await page.waitForURL("/status/resolve-test?edit");

        await page.getByTestId("create-incident-button").click();
        await page.getByTestId("incident-title").fill("Resolved Incident");
        await page.getByTestId("post-incident-button").click();

        await page.waitForTimeout(500);

        const activeIncidentBanner = page.getByTestId("incident").filter({ hasText: "Resolved Incident" });
        await expect(activeIncidentBanner).toBeVisible({ timeout: 10000 });

        const resolveButton = activeIncidentBanner.locator("button", { hasText: "Resolve" });
        await expect(resolveButton).toBeVisible();
        await resolveButton.click();

        await expect(activeIncidentBanner).toHaveCount(0, { timeout: 10000 });

        await page.getByTestId("save-button").click();
        await expect(page.getByTestId("edit-sidebar")).toHaveCount(0);

        // After resolving, an "Incident History" link should appear on the main status page
        await page.goto("./status/resolve-test");
        await page.waitForLoadState("networkidle");

        const historyLink = page.locator("a[href='/status/resolve-test/incidents']");
        await expect(historyLink).toBeVisible({ timeout: 15000 });

        // Navigate to the incident history page and verify the resolved incident is listed
        await historyLink.click();
        await page.waitForURL("**/status/resolve-test/incidents");

        const incidentTitle = page.locator(".incident-title");
        await expect(incidentTitle).toContainText("Resolved Incident", { timeout: 15000 });

        await screenshot(testInfo, page);
    });

    test("incident history pagination loads more incidents", async ({ page }, testInfo) => {
        test.setTimeout(180000);

        await page.goto("./add");
        await login(page);
        await expect(page.getByTestId("monitor-type-select")).toBeVisible();

        await page.goto("./add-status-page");
        await page.getByTestId("name-input").fill("Pagination Test");
        await page.getByTestId("slug-input").fill("pagination-test");
        await page.getByTestId("submit-button").click();
        await page.waitForURL("/status/pagination-test?edit");

        for (let i = 1; i <= 12; i++) {
            await page.getByTestId("create-incident-button").click();
            await page.getByTestId("incident-title").fill("Incident " + i);
            await page.getByTestId("post-incident-button").click();
            await page.waitForTimeout(300);

            const resolveButton = page.locator("button", { hasText: "Resolve" }).first();
            if (await resolveButton.isVisible()) {
                await resolveButton.click();
                await page.waitForTimeout(300);
            }
        }

        await page.getByTestId("save-button").click();
        await expect(page.getByTestId("edit-sidebar")).toHaveCount(0);

        await page.waitForTimeout(1000);

        // Navigate to the dedicated incident history page
        const historyLink = page.locator("a[href='/status/pagination-test/incidents']");
        await expect(historyLink).toBeVisible({ timeout: 15000 });
        await historyLink.click();
        await page.waitForURL("**/status/pagination-test/incidents");

        // Check that incident history content is present
        const incidentItems = page.locator(".incident-item");
        await expect(incidentItems.first()).toBeVisible({ timeout: 15000 });

        // Check for the "Show All" expander button if more than 3 incidents in a month group
        const showAllButton = page.locator("button", { hasText: "Show All" });

        if (await showAllButton.isVisible()) {
            await showAllButton.click();
            await page.waitForTimeout(1000);
            await screenshot(testInfo, page);
        }
    });
});
