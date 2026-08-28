import { readFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { runBinary } from "@/lib/process";
import type { ConversionOutput } from "@/types/converter";

export async function officeToPdf(inputPath: string, directory: string, baseName: string): Promise<ConversionOutput> {
  const profile = pathToFileURL(join(directory, "libreoffice-profile")).href;
  await runBinary("libreoffice", [`-env:UserInstallation=${profile}`, "--headless", "--safe-mode", "--nologo", "--nodefault", "--norestore", "--nolockcheck", "--nofirststartwizard", "--convert-to", "pdf", "--outdir", directory, inputPath]);
  const generated = join(directory, `${basename(inputPath, extname(inputPath))}.pdf`);
  return { data: await readFile(generated), fileName: `${baseName}.pdf`, mimeType: "application/pdf" };
}
