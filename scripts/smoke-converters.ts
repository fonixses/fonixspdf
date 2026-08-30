import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { convertImage, imagesToPdf } from "@/lib/converters/image";
import { ocrPdf } from "@/lib/converters/ocr";
import { compressPdf, mergePdf, pdfToImages, pdfToText, pdfToWord, rotatePdf, splitPdf, textToPdf } from "@/lib/converters/pdf";

function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }

async function run() {
  const root = await mkdtemp(join(tmpdir(), "fonixspdf-smoke-"));
  try {
    const jpg = await sharp({ create: { width: 320, height: 180, channels: 3, background: "#0ea5e9" } }).jpeg().toBuffer();
    const png = await sharp({ create: { width: 180, height: 320, channels: 4, background: { r: 124, g: 58, b: 237, alpha: 0.7 } } }).png().toBuffer();
    assert((await convertImage(jpg, "png", "sample")).data.subarray(1, 4).toString() === "PNG", "JPG to PNG failed");
    assert((await convertImage(png, "jpg", "sample", { quality: 80 })).data[0] === 0xff, "PNG to JPG failed");
    assert((await convertImage(jpg, "webp", "sample")).data.subarray(8, 12).toString() === "WEBP", "JPG to WEBP failed");

    const created = await imagesToPdf([jpg, png], "images", { pageSize: "a4", orientation: "portrait", fileRotations: [0, 90] });
    const createdDoc = await PDFDocument.load(created.data); assert(createdDoc.getPageCount() === 2, "Images to PDF failed");
    const merged = await mergePdf([created.data, created.data]); assert((await PDFDocument.load(merged.data)).getPageCount() === 4, "Merge PDF failed");
    const split = await splitPdf(merged.data, "1,3", "merged"); assert(split.mimeType === "application/zip" && split.data.length > 100, "Split PDF failed");
    const rotated = await rotatePdf(created.data, 90, "images"); assert((await PDFDocument.load(rotated.data)).getPages()[0].getRotation().angle === 90, "Rotate PDF failed");

    const textPdf = await textToPdf(Buffer.from("FonixsPDF smoke test\nUpload. Convert. Download."), "text");
    const inputPath = join(root, "input.pdf"); await writeFile(inputPath, textPdf.data);
    const textDir = join(root, "text"); await mkdir(textDir); const extracted = await pdfToText(inputPath, textDir, "text"); assert(extracted.data.toString().includes("FonixsPDF"), "PDF to TXT failed");
    const wordDir = join(root, "word"); await mkdir(wordDir); const word = await pdfToWord(inputPath, wordDir, "text"); assert(word.data[0] === 0x50 && word.data[1] === 0x4b, "PDF to Word failed");
    const imageDir = join(root, "render"); await mkdir(imageDir); const rendered = await pdfToImages(inputPath, imageDir, "png", "text"); assert(rendered.data.subarray(1, 4).toString() === "PNG", "PDF to PNG failed");
    const compressDir = join(root, "compress"); await mkdir(compressDir); const compressed = await compressPdf(inputPath, compressDir, textPdf.data, "recommended", "text"); assert(compressed.data.subarray(0, 5).toString() === "%PDF-", "Compress PDF failed");
    const ocrDir = join(root, "ocr"); await mkdir(ocrDir); const ocr = await ocrPdf(inputPath, ocrDir, "text"); assert((await PDFDocument.load(ocr.data)).getPageCount() === 1, "OCR PDF failed");
    const searchablePath = join(root, "searchable.pdf"); await writeFile(searchablePath, ocr.data); const ocrTextDir = join(root, "ocr-text"); await mkdir(ocrTextDir); const ocrText = await pdfToText(searchablePath, ocrTextDir, "searchable"); assert(ocrText.data.toString().toLowerCase().includes("fonixspdf"), "OCR searchable text layer failed");
    console.log("Smoke test passed: image conversions, image-to-PDF, merge, split, rotate, PDFBox render/text, QPDF compression, OCR, PDF-to-DOCX, and TXT-to-PDF.");
  } finally { await rm(root, { recursive: true, force: true }); }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
