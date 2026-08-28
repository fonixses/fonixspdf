import { toolMap } from "@/config/tools";
import { convertImage, imagesToPdf } from "@/lib/converters/image";
import { officeToPdf } from "@/lib/converters/office";
import { compressPdf, mergePdf, pdfToImages, pdfToText, pdfToWord, rotatePdf, splitPdf, textToPdf } from "@/lib/converters/pdf";
import type { ConversionOutput, ConverterOptions, ToolId } from "@/types/converter";

interface InputFile { buffer: Buffer; path: string; baseName: string; extension: string }

export async function runConversion(toolId: ToolId, inputs: InputFile[], directory: string, options: ConverterOptions): Promise<ConversionOutput> {
  const first = inputs[0]; const tool = toolMap.get(toolId);
  if (!tool || !first) throw new Error("Unsupported conversion tool.");
  if (["compress-jpg", "compress-png", "compress-webp"].includes(toolId)) {
    const format = toolId.replace("compress-", "") as "jpg" | "png" | "webp"; const result = await convertImage(first.buffer, format, first.baseName, options);
    return result.data.length < first.buffer.length ? result : { ...result, data: first.buffer };
  }
  if (["jpg-to-png", "webp-to-png"].includes(toolId)) return convertImage(first.buffer, "png", first.baseName, options);
  if (["png-to-jpg", "webp-to-jpg"].includes(toolId)) return convertImage(first.buffer, "jpg", first.baseName, options);
  if (["jpg-to-webp", "png-to-webp"].includes(toolId)) return convertImage(first.buffer, "webp", first.baseName, options);
  if (toolId === "jpg-to-pdf" || toolId === "png-to-pdf") return imagesToPdf(inputs.map((input) => input.buffer), first.baseName, options);
  if (toolId === "pdf-to-jpg") return pdfToImages(first.path, directory, "jpg", first.baseName, options.quality);
  if (toolId === "pdf-to-png") return pdfToImages(first.path, directory, "png", first.baseName);
  if (toolId === "merge-pdf") return mergePdf(inputs.map((input) => input.buffer));
  if (toolId === "split-pdf") return splitPdf(first.buffer, options.pageRange, first.baseName);
  if (toolId === "rotate-pdf") return rotatePdf(first.buffer, options.rotation ?? 90, first.baseName);
  if (toolId === "compress-pdf") return compressPdf(first.path, directory, first.buffer, options.compression, first.baseName);
  if (toolId === "pdf-to-txt") return pdfToText(first.path, directory, first.baseName);
  if (toolId === "pdf-to-word") return pdfToWord(first.path, directory, first.baseName);
  if (toolId === "txt-to-pdf") return textToPdf(first.buffer, first.baseName);
  if (["word-to-pdf", "excel-to-pdf", "powerpoint-to-pdf"].includes(toolId)) return officeToPdf(first.path, directory, first.baseName);
  throw new Error("This conversion is not implemented.");
}

export function resolveUniversalTool(extension: string, outputFormat: string): ToolId | null {
  const normalizedInput = extension === "jpeg" ? "jpg" : extension;
  const normalizedOutput = outputFormat === "jpeg" ? "jpg" : outputFormat;
  const direct = `${normalizedInput}-to-${normalizedOutput}` as ToolId;
  if (toolMap.has(direct)) return direct;
  if (["doc", "docx"].includes(normalizedInput) && normalizedOutput === "pdf") return "word-to-pdf";
  if (["xls", "xlsx"].includes(normalizedInput) && normalizedOutput === "pdf") return "excel-to-pdf";
  if (["ppt", "pptx"].includes(normalizedInput) && normalizedOutput === "pdf") return "powerpoint-to-pdf";
  return null;
}
