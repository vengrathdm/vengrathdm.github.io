import { chromium } from "playwright";
import { readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const excluded = "ksiazeta-heartwell";
const campaignRoot = path.join(root, "p");
const entries = await readdir(campaignRoot, { withFileTypes: true });
const pages = entries
  .filter((entry) => entry.isDirectory() && entry.name.toLowerCase() !== excluded)
  .map((entry) => path.join("p", entry.name, "index.html"))
  .filter(async (file) => file);

const eligible = [];
for (const file of pages) {
  try {
    const { access } = await import("node:fs/promises");
    await access(path.join(root, file));
    eligible.push(file);
  } catch {}
}
if (!eligible.length) throw new Error("No eligible campaign pages found.");

const browser = await chromium.launch({ headless: true });
const failures = [];
try {
  for (const file of eligible.sort()) {
    const relativeUrl = "/" + file.split(path.sep).join("/");
    for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport });
      const pageErrors = [];
      const localFailures = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("requestfailed", (request) => {
        if (new URL(request.url()).hostname === "127.0.0.1") {
          localFailures.push(request.url() + " — " + (request.failure()?.errorText || "request failed"));
        }
      });
      try {
        const response = await page.goto("http://127.0.0.1:8000" + relativeUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
        if (!response || !response.ok()) throw new Error("HTTP response " + (response?.status() ?? "missing"));
        await page.locator(".v-subpage-navbar__link[data-tab-target]").first().waitFor({ state: "visible", timeout: 5000 });
        await page.waitForTimeout(100);
        const tabs = page.locator(".v-subpage-navbar__link[data-tab-target]");
        const tabCount = await tabs.count();
        if (!tabCount) throw new Error("No shared navigation tabs found");
        for (let index = 0; index < tabCount; index++) {
          const tab = tabs.nth(index);
          const target = await tab.getAttribute("data-tab-target");
          const id = (target || "").replace(/^#/, "");
          if (!id) {
            failures.push(file + " @ " + viewport.width + "px: tab has an empty target");
            continue;
          }
          const targetExists = await page.evaluate((targetId) => Boolean(document.getElementById(targetId)), id);
          if (!targetExists) {
            failures.push(file + " @ " + viewport.width + "px: missing panel #" + id);
            continue;
          }
          await tab.click();
          const visible = await page.evaluate((targetId) => {
            const panel = document.getElementById(targetId);
            return Boolean(panel && !panel.hidden && getComputedStyle(panel).display !== "none");
          }, id);
          if (!visible) failures.push(file + " @ " + viewport.width + "px: tab did not reveal #" + id);
        }
        const audioRoot = page.locator("[data-v-audio-player]");
        if (await audioRoot.count()) {
          const audioButton = audioRoot.locator("button").first();
          if (!(await audioButton.isVisible())) {
            failures.push(file + " @ " + viewport.width + "px: audio control is not visible");
          } else if (await audioButton.isDisabled()) {
            failures.push(file + " @ " + viewport.width + "px: audio control is disabled");
          } else {
            await audioButton.click();
            await page.waitForTimeout(150);
            if (await audioButton.isDisabled()) {
              failures.push(file + " @ " + viewport.width + "px: manual audio control became disabled after interaction");
            }
          }
        }
        const metrics = await page.evaluate(() => ({
          viewport: window.innerWidth,
          document: document.documentElement.scrollWidth,
        }));
        if (metrics.document > metrics.viewport + 2) {
          failures.push(file + " @ " + viewport.width + "px: horizontal overflow (" + metrics.document + "px document / " + metrics.viewport + "px viewport)");
        }
        if (pageErrors.length) failures.push(file + " @ " + viewport.width + "px: uncaught browser errors: " + pageErrors.join(" | "));
        if (localFailures.length) failures.push(file + " @ " + viewport.width + "px: failed local requests: " + localFailures.join(" | "));
      } catch (error) {
        failures.push(file + " @ " + viewport.width + "px: " + error.message);
      } finally {
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
}
console.log("Browser smoke test checked " + eligible.length + " eligible campaign pages at desktop and mobile viewports.");
if (failures.length) {
  console.error(failures.join("\n"));
  console.error("Found " + failures.length + " browser smoke-test failure(s).");
  process.exitCode = 1;
} else {
  console.log("All campaign navigation, runtime, local-request, and horizontal-overflow checks passed.");
}
