import { existsSync } from "node:fs";
import { join } from "node:path";
import { runBinary } from "@/lib/process";

const DEFAULT_PDFBOX_JAR = join(process.cwd(), "vendor", "pdfbox-app-3.0.8.jar");
const DEFAULT_QPDF_BINARY = join(process.cwd(), "vendor", "qpdf-12.4.0", "bin", "qpdf");

export function pdfBoxJarPath() {
  const configured = process.env.PDFBOX_JAR_PATH?.trim();
  const path = configured || DEFAULT_PDFBOX_JAR;
  if (!existsSync(path)) {
    throw new Error("Apache PDFBox is not installed. Run npm run setup:pdfbox or set PDFBOX_JAR_PATH.");
  }
  return path;
}

export function runPdfBox(args: string[]) {
  return runBinary("java", ["-Djava.awt.headless=true", "-jar", pdfBoxJarPath(), ...args]);
}

export function qpdfBinaryPath() {
  const configured = process.env.QPDF_BINARY_PATH?.trim();
  if (configured) return configured;
  return existsSync(DEFAULT_QPDF_BINARY) ? DEFAULT_QPDF_BINARY : "qpdf";
}
