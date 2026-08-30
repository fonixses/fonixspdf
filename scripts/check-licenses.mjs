import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const manifest = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const notices = await readFile(join(root, "THIRD_PARTY_NOTICES.md"), "utf8");
const allowed = new Set(["MIT", "Apache-2.0", "ISC", "(MIT OR GPL-3.0-or-later)"]);
const failures = [];

for (const name of Object.keys(manifest.dependencies ?? {})) {
  const dependency = JSON.parse(await readFile(join(root, "node_modules", name, "package.json"), "utf8"));
  if (!allowed.has(dependency.license)) failures.push(`${name}@${dependency.version}: ${dependency.license || "missing license"}`);
  if (!notices.includes(`| ${name} | ${dependency.version} |`)) failures.push(`${name}@${dependency.version}: missing or stale THIRD_PARTY_NOTICES.md entry`);
}

if (failures.length) {
  console.error(`Review these dependency licenses before release:\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log("Direct runtime dependency licenses match the approved notice list.");
}
