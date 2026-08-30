import { createHash } from "node:crypto";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const version = "3.0.8";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const destination = join(root, "vendor", `pdfbox-app-${version}.jar`);
const temporary = `${destination}.download`;
const baseUrl = `https://downloads.apache.org/pdfbox/${version}/pdfbox-app-${version}.jar`;

async function download(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

await mkdir(dirname(destination), { recursive: true });
try {
  const [archive, checksumFile] = await Promise.all([download(baseUrl), download(`${baseUrl}.sha512`)]);
  const expected = checksumFile.toString("utf8").trim().split(/\s+/)[0].toLowerCase();
  const actual = createHash("sha512").update(archive).digest("hex");
  if (!expected || actual !== expected) throw new Error("PDFBox SHA-512 checksum verification failed.");
  await writeFile(temporary, archive, { flag: "w" });
  await rename(temporary, destination);
  console.log(`Installed Apache PDFBox ${version} at ${destination}`);
} finally {
  await rm(temporary, { force: true });
}
