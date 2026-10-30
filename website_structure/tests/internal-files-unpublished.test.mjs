import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync, readFileSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {dirname, join} from "node:path";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";

const site = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(site, "..");

const unusedAssetMasters = new Set([
  "assets/BYES_logo_rvb-1.png",
  "assets/bouygues_uk-colour-logo-a0-p-e1717078325841.png",
  "assets/bp-helios-card-2x1.webp.avif",
  "assets/images.jpeg",
]);

function isPublicSiteFile(rel) {
  if (["vercel.json", ".vercelignore", "robots.txt", "sitemap.xml", "llms.txt", "favicon.ico"].includes(rel)) return true;
  if (rel.startsWith("api/")) return true;
  if (rel.startsWith("partials/")) return false;
  if (rel.endsWith(".html")) return true;
  if (rel.startsWith("assets/")) {
    if (rel === "assets/.DS_Store") return false;
    if (rel.startsWith("assets/Ignis logo (Logo)-3/")) return false;
    if (unusedAssetMasters.has(rel)) return false;
    return true;
  }
  return false;
}

function trackedSiteFiles() {
  const listed = spawnSync("git", ["ls-files", "-z", "website_structure"], {
    cwd: repo,
    encoding: "utf8",
  });
  assert.equal(listed.status, 0, listed.stderr);
  return listed.stdout.split("\0").filter(Boolean).map((path) => path.slice("website_structure/".length));
}

function ignoredByVercel(paths) {
  const dir = mkdtempSync(join(tmpdir(), "ignis-vercelignore-"));
  const init = spawnSync("git", ["init"], {cwd: dir, encoding: "utf8"});
  assert.equal(init.status, 0, init.stderr);
  writeFileSync(join(dir, ".gitignore"), readFileSync(join(site, ".vercelignore")));
  const check = spawnSync(
    "git",
    ["-c", "core.excludesFile=", "check-ignore", "--no-index", "--", ...paths],
    {cwd: dir, encoding: "utf8"}
  );
  assert.ok(check.status === 0 || check.status === 1, check.stderr);
  return new Set(check.stdout.split("\n").filter(Boolean));
}

test("internal working files are excluded from the Vercel deployment and public files are not", () => {
  const files = trackedSiteFiles();
  const ignored = ignoredByVercel(files);
  const privateFiles = files.filter((rel) => !isPublicSiteFile(rel));
  const publicFiles = files.filter((rel) => isPublicSiteFile(rel));

  assert.ok(privateFiles.length > 0);
  assert.ok(publicFiles.includes("index.html"));
  assert.ok(publicFiles.includes("insights/what-gate-2-is-really-about.html"));
  assert.ok(publicFiles.includes("reports/market-monitor-2026-10.html"));
  assert.ok(publicFiles.includes("assets/downloads/ignis-market-monitor-2026-10.pdf"));
  assert.ok(publicFiles.includes("api/subscribe.js"));
  assert.ok(publicFiles.includes("robots.txt"));
  assert.ok(publicFiles.includes("sitemap.xml"));
  assert.ok(publicFiles.includes("llms.txt"));
  assert.ok(publicFiles.includes("favicon.ico"));

  const stillPublished = privateFiles.filter((rel) => !ignored.has(rel));
  const wronglyHidden = publicFiles.filter((rel) => ignored.has(rel));
  assert.deepEqual(stillPublished, [], `still published:\n${stillPublished.join("\n")}`);
  assert.deepEqual(wronglyHidden, [], `wrongly hidden:\n${wronglyHidden.join("\n")}`);
});
