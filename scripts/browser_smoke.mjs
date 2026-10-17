import { chromium } from "playwright";
import { readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const excluded = "ksiazeta-heartwell";
const campaignRoot = path.join(root, "p");
const entries = await readdir(campaignRoot, { withFileTypes: true });
const { access } = await import("node:fs/promises");
const candidates = entries
  .filter((entry) => entry.isDirectory() && entry.name.toLowerCase() !== excluded)
  .map((entry) => path.join("p", entry.name, "index.html"));

const eligible = [];
for (const file of candidates) {
  try {
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
      page.on("pageerror", (error) => pageErrors.push(error.stack || error.message));
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
        const audioRoot = page.locator("[data-v-audio-player]");
        if (await audioRoot.count()) {
          const audioButton = audioRoot.locator("button").first();
          if (!(await audioButton.isVisible())) {
            failures.push(file + " @ " + viewport.width + "px: audio control is not visible");
          } else if (await audioButton.isDisabled()) {
            failures.push(file + " @ " + viewport.width + "px: audio control is disabled");
          } else {
            const audio = audioRoot.locator("audio").first();
            // Stub only the media engine: codec/network availability varies on CI runners.
            // This still verifies that the user gesture reaches the component's play handler.
            await audio.evaluate(element => {
              element.pause();
              element.muted = true;
              element.dataset.playInvoked = "false";
              element.play = function () {
                this.dataset.playInvoked = "true";
                return Promise.resolve();
              };
            });
            await audioButton.click();
            const playInvoked = await audio.getAttribute("data-play-invoked");
            if (playInvoked !== "true") {
              failures.push(file + " @ " + viewport.width + "px: manual audio control did not invoke the media play method");
            }
            if (await audioButton.isDisabled()) {
              failures.push(file + " @ " + viewport.width + "px: manual audio control became disabled after interaction");
            }
          }
        }
        if (file === "p/PerfectMigrationTemplate/index.html") {
          const dynamicButton = await page.evaluate(() => {
            const root = document.createElement("div");
            root.dataset.vengrathButton = "";
            window.VengrathButton.init(root);
            return {
              link: root.querySelector("a")?.getAttribute("href"),
              image: root.querySelector("img")?.getAttribute("src"),
            };
          });
          if (dynamicButton.link !== "https://vengrathdm.github.io/" || !dynamicButton.image || !dynamicButton.image.includes("vengrath-button-background.png")) {
            failures.push(file + ": dynamic Vengrath button initialization produced invalid links or assets");
          }
        }
        await page.locator(".v-subpage-navbar__link[data-tab-target]").first().focus();
        await page.keyboard.press("Tab");
        const focusResult = await page.evaluate(() => {
          const element = document.activeElement;
          const focusable = [...document.querySelectorAll("a[href], button, input, select, textarea, summary, [tabindex]")].slice(0, 6).map(item => ({
            tag: item.tagName, id: item.id, className: String(item.className || ""), tabIndex: item.tabIndex,
            hidden: item.hidden || item.closest("[hidden]") !== null,
          }));
          return {
            focused: Boolean(element && element !== document.body && element !== document.documentElement && element.tabIndex >= 0),
            active: element ? { tag: element.tagName, id: element.id, className: String(element.className || ""), tabIndex: element.tabIndex } : null,
            focusable,
          };
        });
        if (!focusResult.focused) failures.push(file + " @ " + viewport.width + "px: Tab key did not reach a focusable control; " + JSON.stringify(focusResult));
        const tabs = page.locator(".v-subpage-navbar__link[data-tab-target]");
        const tabCount = await tabs.count();
        if (!tabCount) throw new Error("No shared navigation tabs found");
        for (let index = 0; index < tabCount; index++) {
          const tab = tabs.nth(index);
          const label = (await tab.innerText()).trim();
          if (!label) failures.push(file + " @ " + viewport.width + "px: navigation tab has no accessible text");
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
          if (id === "characters") {
            try {
              await page.waitForFunction(() => {
                const panel = document.getElementById("characters");
                return panel && ["ready", "error"].includes(panel.dataset.characterRegistryStatus);
              }, null, { timeout: 8000 });
              const characterCheck = await page.evaluate(async () => {
                const panel = document.getElementById("characters");
                const response = await fetch("/res/characters.json");
                if (!response.ok) throw new Error("characters.json returned " + response.status);
                const registry = await response.json();
                const campaignName = panel.dataset.campaignName;
                const expected = registry
                  .filter(item => item && Array.isArray(item.campaigns) && item.campaigns.includes(campaignName))
                  .map(item => String(item.id || ""));
                const actual = [...panel.querySelectorAll(".v-character-card")]
                  .map(item => item.dataset.characterId || "");
                return {
                  status: panel.dataset.characterRegistryStatus,
                  campaignName,
                  expected,
                  actual,
                  count: panel.dataset.characterCount,
                };
              });
              if (characterCheck.status !== "ready") {
                failures.push(file + " @ " + viewport.width + "px: character registry failed to load");
              } else if (JSON.stringify(characterCheck.expected) !== JSON.stringify(characterCheck.actual)) {
                failures.push(file + " @ " + viewport.width + "px: character cards do not match res/characters.json for " + characterCheck.campaignName + " (expected " + characterCheck.expected.length + ", rendered " + characterCheck.actual.length + ")");
              }
              const visibleHistory = await page.locator("#characters .v-character-card .v-character-card__description").count();
              if (visibleHistory) {
                failures.push(file + " @ " + viewport.width + "px: campaign character cards must not display history (" + visibleHistory + " history blocks found)");
              }
            } catch (error) {
              failures.push(file + " @ " + viewport.width + "px: character registry check failed: " + error.message);
            }
          }
        }
        // Regression: a hard refresh on the first tab must not reveal the
        // dynamically-created character panel or its cards alongside the main panel.
        const firstTarget = await tabs.first().getAttribute("data-tab-target");
        if (firstTarget) {
          await page.goto("http://127.0.0.1:8000" + relativeUrl + firstTarget, { waitUntil: "domcontentloaded", timeout: 20000 });
          await page.waitForTimeout(150);
          const tabVisibility = await page.evaluate((target) => {
            const targetId = target.replace(/^#/, "");
            const panels = [...document.querySelectorAll("[data-v-tab-panel]")];
            return {
              targetVisible: Boolean(document.getElementById(targetId) && !document.getElementById(targetId).hidden && getComputedStyle(document.getElementById(targetId)).display !== "none"),
              unexpectedVisiblePanels: panels.filter(panel => panel.id !== targetId && !panel.hidden && getComputedStyle(panel).display !== "none").map(panel => panel.id),
            };
          }, firstTarget);
          if (!tabVisibility.targetVisible) failures.push(file + " @ " + viewport.width + "px: first tab panel was not visible after hard refresh");
          if (tabVisibility.unexpectedVisiblePanels.length) {
            failures.push(file + " @ " + viewport.width + "px: extra tab panels visible after hard refresh on " + firstTarget + ": " + tabVisibility.unexpectedVisiblePanels.join(", "));
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
