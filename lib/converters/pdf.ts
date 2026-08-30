import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { Document, Packer, Paragraph } from "docx";
import JSZip from "jszip";
import { degrees, PDFDocument, StandardFonts } from "pdf-lib";
import { qpdfBinaryPath, runPdfBox } from "@/lib/converters/pdf-engine";
import { runBinary } from "@/lib/process";
import type { ConversionOutput, ConverterOptions } from "@/types/converter";

export async function mergePdf(inputs: Buffer[]): Promise<ConversionOutput> {
  const merged = await PDFDocument.create();
  for (const input of inputs) {
    const source = await PDFDocument.load(input, { ignoreEncryption: false });
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  return { data: Buffer.from(await merged.save()), fileName: "merged.pdf", mimeType: "application/pdf" };
}

function selectedPages(expression: string | undefined, count: number) {
  if (!expression?.trim()) return Array.from({ length: count }, (_, index) => index);
  const pages = new Set<number>();
  for (const part of expression.split(",")) {
    const value = part.trim();
    if (/^\d+$/.test(value)) pages.add(Number(value) - 1);
    else {
      const match = value.match(/^(\d+)-(\d+)$/);
      if (!match) throw new Error("Invalid page range. Use a value such as 1-3 or 1,3,5.");
      const start = Number(match[1]); const end = Number(match[2]);
      if (start > end) throw new Error("The first page in a range must be smaller than the last page.");
      for (let page = start; page <= end; page++) pages.add(page - 1);
    }
  }
  const result = [...pages].sort((a, b) => a - b);
  if (!result.length || result.some((page) => page < 0 || page >= count)) throw new Error(`Page range must be between 1 and ${count}.`);
  return result;
}

export async function splitPdf(input: Buffer, range: string | undefined, baseName: string): Promise<ConversionOutput> {
  const source = await PDFDocument.load(input);
  const pages = selectedPages(range, source.getPageCount());
  const results: { name: string; data: Buffer }[] = [];
  for (const pageNumber of pages) {
    const document = await PDFDocument.create();
    const [page] = await document.copyPages(source, [pageNumber]); document.addPage(page);
    results.push({ name: `${baseName}-page-${pageNumber + 1}.pdf`, data: Buffer.from(await document.save()) });
  }
  if (results.length === 1) return { data: results[0].data, fileName: results[0].name, mimeType: "application/pdf" };
  const zip = new JSZip(); results.forEach((result) => zip.file(result.name, result.data));
  return { data: await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }), fileName: `${baseName}-pages.zip`, mimeType: "application/zip" };
}

export async function rotatePdf(input: Buffer, rotation: number, baseName: string): Promise<ConversionOutput> {
  const document = await PDFDocument.load(input);
  document.getPages().forEach((page) => page.setRotation(degrees((page.getRotation().angle + rotation + 360) % 360)));
  return { data: Buffer.from(await document.save()), fileName: `${baseName}-rotated.pdf`, mimeType: "application/pdf" };
}

export async function compressPdf(inputPath: string, directory: string, input: Buffer, level: ConverterOptions["compression"], baseName: string): Promise<ConversionOutput> {
  const outputPath = join(directory, "compressed-output.pdf");
  const args = [inputPath, "--object-streams=generate", "--compress-streams=y", "--decode-level=generalized", "--recompress-flate", "--compression-level=9"];
  if (level !== "low") args.push("--optimize-images", `--jpeg-quality=${level === "high" ? 55 : 78}`);
  args.push(outputPath);
  await runBinary(qpdfBinaryPath(), args);
  const compressed = await readFile(outputPath);
  return { data: compressed.length < input.length ? compressed : input, fileName: `${baseName}-compressed.pdf`, mimeType: "application/pdf" };
}

export async function pdfToImages(inputPath: string, directory: string, format: "jpg" | "png", baseName: string, quality = 90): Promise<ConversionOutput> {
  const prefix = join(directory, "rendered-page");
  const args = ["render", `-i=${inputPath}`, `-outputPrefix=${prefix}`, `-format=${format}`, "-dpi=150", "-subsampling"];
  if (format === "jpg") args.push(`-quality=${Math.min(100, Math.max(20, quality)) / 100}`);
  await runPdfBox(args);
  const names = (await readdir(directory)).filter((name) => new RegExp(`^rendered-page-\\d+\\.${format}$`).test(name)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!names.length) throw new Error("No pages could be rendered from this PDF.");
  if (names.length === 1) return { data: await readFile(join(directory, names[0])), fileName: `${baseName}.${format}`, mimeType: `image/${format === "jpg" ? "jpeg" : "png"}` };
  const zip = new JSZip();
  for (let index = 0; index < names.length; index++) zip.file(`page-${index + 1}.${format}`, await readFile(join(directory, names[index])));
  return { data: await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }), fileName: `${baseName}-images.zip`, mimeType: "application/zip" };
}

export async function extractPdfText(inputPath: string, directory: string) {
  const outputPath = join(directory, "extracted.txt");
  await runPdfBox(["export:text", `-i=${inputPath}`, `-o=${outputPath}`, "-encoding=UTF-8", "-sort"]);
  return (await readFile(outputPath, "utf8")).replace(/\r\n/g, "\n").trim();
}

export async function pdfToText(inputPath: string, directory: string, baseName: string): Promise<ConversionOutput> {
  const text = await extractPdfText(inputPath, directory);
  return { data: Buffer.from(text, "utf8"), fileName: `${baseName}.txt`, mimeType: "text/plain; charset=utf-8" };
}

export async function pdfToWord(inputPath: string, directory: string, baseName: string): Promise<ConversionOutput> {
  const text = await extractPdfText(inputPath, directory);
  const paragraphs = (text || "No extractable text was found in this PDF.").split(/\n+/).map((line) => new Paragraph({ text: line }));
  const document = new Document({ sections: [{ properties: {}, children: paragraphs }] });
  return { data: await Packer.toBuffer(document), fileName: `${baseName}.docx`, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
}

export async function textToPdf(input: Buffer, baseName: string): Promise<ConversionOutput> {
  const document = await PDFDocument.create(); const font = await document.embedFont(StandardFonts.Helvetica);
  const size = 11; const lineHeight = 15; const pageWidth = 595.28; const pageHeight = 841.89; const margin = 54;
  const maxChars = 92; const lines: string[] = [];
  for (const rawLine of input.toString("utf8").replace(/\r/g, "").split("\n")) {
    if (!rawLine) { lines.push(""); continue; }
    for (let start = 0; start < rawLine.length; start += maxChars) lines.push(rawLine.slice(start, start + maxChars));
  }
  let page = document.addPage([pageWidth, pageHeight]); let y = pageHeight - margin;
  for (const line of lines) {
    if (y < margin) { page = document.addPage([pageWidth, pageHeight]); y = pageHeight - margin; }
    page.drawText(line.replace(/[^\x20-\x7E]/g, "?"), { x: margin, y, size, font }); y -= lineHeight;
  }
  return { data: Buffer.from(await document.save()), fileName: `${baseName}.pdf`, mimeType: "application/pdf" };
}
