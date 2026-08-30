import { createHash } from "node:crypto";
import { chmod, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { dirname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import JSZip from "jszip";

const version = "12.4.0";
const expectedSha256 = "a3bca240f3bb61efdc3a90be89d1da4ed5e125326c3458c4e62df53ff4f153e3";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const destination = join(root, "vendor", `qpdf-${version}`);
const url = `https://github.com/qpdf/qpdf/releases/download/v${version}/qpdf-${version}-bin-linux-x86_64.zip`;

if (process.platform !== "linux" || process.arch !== "x64") {
  throw new Error("The bundled QPDF installer supports Linux x64. Install qpdf with your OS package manager and set QPDF_BINARY_PATH.");
}

const response = await fetch(url);
if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);
const archive = Buffer.from(await response.arrayBuffer());
const actualSha256 = createHash("sha256").update(archive).digest("hex");
if (actualSha256 !== expectedSha256) throw new Error("QPDF SHA-256 checksum verification failed.");

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
const zip = await JSZip.loadAsync(archive);
const rootPrefix = Object.keys(zip.files).find((name) => name.endsWith("/")) || "";
for (const entry of Object.values(zip.files)) {
  const relative = entry.name.startsWith(rootPrefix) ? entry.name.slice(rootPrefix.length) : entry.name;
  if (!relative || entry.dir) continue;
  const safeRelative = normalize(relative);
  if (safeRelative.startsWith(`..${sep}`) || safeRelative === "..") throw new Error("Unsafe path in QPDF archive.");
  const target = join(destination, safeRelative);
  await mkdir(dirname(target), { recursive: true });
  const fileType = typeof entry.unixPermissions === "number" ? entry.unixPermissions & 0o170000 : 0;
  if (fileType === 0o120000) await symlink(await entry.async("string"), target);
  else await writeFile(target, await entry.async("nodebuffer"));
}
await chmod(join(destination, "bin", "qpdf"), 0o755);
console.log(`Installed QPDF ${version} at ${destination}`);
