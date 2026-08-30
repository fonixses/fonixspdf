import { copyFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import engData from "@tesseract.js-data/eng";
import indData from "@tesseract.js-data/ind";
import { PDFDocument } from "pdf-lib";
import { createWorker, OEM } from "tesseract.js";
import { runPdfBox } from "@/lib/converters/pdf-engine";
import type { ConversionOutput } from "@/types/converter";

export async function ocrPdf(inputPath: string, directory: string, baseName: string): Promise<ConversionOutput> {
  const prefix = join(directory, "ocr-page");
  await runPdfBox(["render", `-i=${inputPath}`, `-outputPrefix=${prefix}`, "-format=png", "-dpi=200", "-subsampling"]);
  const pageImages = (await readdir(directory))
    .filter((name) => /^ocr-page-\d+\.png$/.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!pageImages.length) throw new Error("No pages could be rendered for OCR.");

  const requestedLanguages = (process.env.FONIXS_OCR_LANG?.trim() || "eng+ind").split("+");
  const supportedData = { eng: engData, ind: indData } as const;
  if (requestedLanguages.some((language) => !(language in supportedData))) throw new Error("OCR language is not bundled. Supported values are eng, ind, or eng+ind.");

  const tessdataDirectory = join(directory, "tessdata");
  await mkdir(tessdataDirectory);
  for (const language of requestedLanguages as (keyof typeof supportedData)[]) {
    const source = join(supportedData[language].langPath, `${language}.traineddata.gz`);
    await copyFile(source, join(tessdataDirectory, `${language}.traineddata.gz`));
  }

  const worker = await createWorker(requestedLanguages, OEM.LSTM_ONLY, { langPath: tessdataDirectory, gzip: true, cacheMethod: "none" });
  const merged = await PDFDocument.create();
  try {
    for (const pageImage of pageImages) {
      const result = await worker.recognize(join(directory, pageImage), { pdfTitle: baseName }, { text: true, pdf: true });
      if (!result.data.pdf) throw new Error("OCR did not produce a searchable PDF page.");
      const pageDocument = await PDFDocument.load(Uint8Array.from(result.data.pdf));
      const pages = await merged.copyPages(pageDocument, pageDocument.getPageIndices());
      pages.forEach((page) => merged.addPage(page));
    }
  } finally {
    await worker.terminate();
  }

  return {
    data: Buffer.from(await merged.save()),
    fileName: `${baseName}-searchable.pdf`,
    mimeType: "application/pdf",
  };
}
