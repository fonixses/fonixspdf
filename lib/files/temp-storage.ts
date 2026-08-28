import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/config/site";
import type { ConversionOutput } from "@/types/converter";

const ROOT = process.env.FONIXS_TEMP_DIR ?? join(process.cwd(), "temp");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
interface ResultMetadata { internalName: string; downloadName: string; mimeType: string; originalSize: number; resultSize: number; createdAt: string }

export async function createJob() {
  await mkdir(ROOT, { recursive: true });
  const id = randomUUID(); const directory = join(ROOT, id);
  await mkdir(directory, { recursive: false });
  return { id, directory };
}
export async function writeInput(directory: string, buffer: Buffer, extension: string) {
  const filePath = join(directory, `${randomUUID()}.${extension}`);
  await writeFile(filePath, buffer, { flag: "wx" });
  return filePath;
}
export async function storeResult(jobId: string, directory: string, output: ConversionOutput, originalSize: number) {
  const extension = output.fileName.split(".").pop()?.toLowerCase() || "bin";
  const internalName = `${randomUUID()}.${extension}`;
  await writeFile(join(directory, internalName), output.data, { flag: "wx" });
  const metadata: ResultMetadata = { internalName, downloadName: output.fileName, mimeType: output.mimeType, originalSize, resultSize: output.data.length, createdAt: new Date().toISOString() };
  await writeFile(join(directory, "result.json"), JSON.stringify(metadata), { flag: "wx" });
  return { jobId, downloadUrl: `/api/download/${jobId}`, ...metadata };
}
export async function readResult(jobId: string) {
  if (!UUID.test(jobId)) return null;
  try {
    const directory = join(ROOT, jobId);
    const metadata = JSON.parse(await readFile(join(directory, "result.json"), "utf8")) as ResultMetadata;
    if (!/^[0-9a-f-]+\.[a-z0-9]+$/i.test(metadata.internalName)) return null;
    return { metadata, data: await readFile(join(directory, metadata.internalName)) };
  } catch { return null; }
}
export async function removeJob(jobId: string) { if (UUID.test(jobId)) await rm(join(ROOT, jobId), { recursive: true, force: true }); }
export async function cleanupExpiredJobs() {
  await mkdir(ROOT, { recursive: true }); const cutoff = Date.now() - siteConfig.retentionMinutes * 60_000;
  for (const entry of await readdir(ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory() || !UUID.test(entry.name)) continue;
    try { if ((await stat(join(ROOT, entry.name))).mtimeMs < cutoff) await rm(join(ROOT, entry.name), { recursive: true, force: true }); } catch { /* already removed */ }
  }
}
