/** Dev validation for the cinematic media system. No secrets, no network. */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];

function check(rel, label) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    warnings.push(`missing ${label}: ${rel}`);
    return false;
  }
  return true;
}

// 1. Local media directories per configured destination
const dests = ["kashmir", "ladakh", "sikkim", "kerala", "rajasthan", "goa", "meghalaya", "darjeeling"];
for (const d of dests) {
  check(`public/media/destinations/${d}`, `local media dir for ${d} (fallback active until licensed files ship)`);
}

// 2. Config references resolve to known destinations (read raw file, no TS needed)
// Aliases resolve to grouped records (meghalaya → northeast-india, darjeeling → west-bengal).
const ALIASES = { meghalaya: "northeast-india", darjeeling: "west-bengal" };
const mediaRaw = fs.readFileSync(path.join(root, "src/data/media.ts"), "utf8");
const destRaw = fs.readFileSync(path.join(root, "src/data/destinations.ts"), "utf8");
for (const d of dests) {
  if (!mediaRaw.includes(d)) errors.push(`media config missing queries for ${d}`);
  const resolved = ALIASES[d] ?? d;
  if (!destRaw.includes(`slug: "${resolved}"`) && !destRaw.includes(`slug: '${resolved}'`)) warnings.push(`destinations.ts has no slug "${resolved}" (via alias ${d})`);
}

// 3. No NEXT_PUBLIC Unsplash key anywhere (secret must stay server-side)
try {
  const hits = execSync('grep -rn "NEXT_PUBLIC_UNSPLASH" src backend 2>/dev/null || true', { cwd: root }).toString().trim();
  if (hits) errors.push(`public Unsplash key reference found:\n${hits}`);
} catch {}

// 4. Attribution component present
if (!fs.existsSync(path.join(root, "src/components/media/MediaAttribution.tsx"))) {
  errors.push("MediaAttribution component missing");
}

console.log("— Tripifi media validation —");
warnings.forEach((w) => console.log("WARN:", w));
if (errors.length) {
  errors.forEach((e) => console.log("ERROR:", e));
  process.exit(1);
}
console.log(`OK: ${dests.length} destinations configured, no public key leaks, attribution present.`);
