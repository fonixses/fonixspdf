import type { ToolCategory, ToolConfig, ToolId } from "@/types/converter";

const detail = (input: string, output: string) => `Convert ${input} files to ${output} online for free with fast, private processing.`;

export const tools: ToolConfig[] = [
  { id: "pdf-to-word", name: "PDF to Word", shortDescription: "Turn PDF into an editable Word document.", description: detail("PDF", "Word"), category: "PDF Converter", icon: "file-text", inputExtensions: ["pdf"], outputExtension: "docx" },
  { id: "word-to-pdf", name: "Word to PDF", shortDescription: "Convert DOC and DOCX documents to PDF.", description: detail("Word", "PDF"), category: "PDF Converter", icon: "file-text", inputExtensions: ["doc", "docx"], outputExtension: "pdf" },
  { id: "pdf-to-jpg", name: "PDF to JPG", shortDescription: "Export every PDF page as a JPG image.", description: detail("PDF", "JPG"), category: "PDF Converter", icon: "file-image", inputExtensions: ["pdf"], outputExtension: "jpg", quality: true },
  { id: "jpg-to-pdf", name: "JPG to PDF", shortDescription: "Combine and arrange JPG images in one PDF.", description: detail("JPG", "PDF"), category: "PDF Converter", icon: "image", inputExtensions: ["jpg", "jpeg"], outputExtension: "pdf", multiple: true, pageOptions: true },
  { id: "pdf-to-png", name: "PDF to PNG", shortDescription: "Export PDF pages as crisp PNG images.", description: detail("PDF", "PNG"), category: "PDF Converter", icon: "file-image", inputExtensions: ["pdf"], outputExtension: "png" },
  { id: "png-to-pdf", name: "PNG to PDF", shortDescription: "Combine and arrange PNG images in one PDF.", description: detail("PNG", "PDF"), category: "PDF Converter", icon: "image", inputExtensions: ["png"], outputExtension: "pdf", multiple: true, pageOptions: true },
  { id: "jpg-to-png", name: "JPG to PNG", shortDescription: "Convert JPG images into PNG format.", description: detail("JPG", "PNG"), category: "Image Converter", icon: "image", inputExtensions: ["jpg", "jpeg"], outputExtension: "png" },
  { id: "png-to-jpg", name: "PNG to JPG", shortDescription: "Convert PNG to JPG with a clean white background.", description: detail("PNG", "JPG"), category: "Image Converter", icon: "image", inputExtensions: ["png"], outputExtension: "jpg", quality: true },
  { id: "webp-to-jpg", name: "WEBP to JPG", shortDescription: "Make WEBP images universally compatible.", description: detail("WEBP", "JPG"), category: "Image Converter", icon: "image", inputExtensions: ["webp"], outputExtension: "jpg", quality: true },
  { id: "jpg-to-webp", name: "JPG to WEBP", shortDescription: "Create smaller, web-ready WEBP images.", description: detail("JPG", "WEBP"), category: "Image Converter", icon: "image", inputExtensions: ["jpg", "jpeg"], outputExtension: "webp", quality: true },
  { id: "png-to-webp", name: "PNG to WEBP", shortDescription: "Convert PNG images to efficient WEBP.", description: detail("PNG", "WEBP"), category: "Image Converter", icon: "image", inputExtensions: ["png"], outputExtension: "webp", quality: true },
  { id: "webp-to-png", name: "WEBP to PNG", shortDescription: "Convert WEBP images into lossless PNG.", description: detail("WEBP", "PNG"), category: "Image Converter", icon: "image", inputExtensions: ["webp"], outputExtension: "png" },
  { id: "compress-jpg", name: "Compress JPG", shortDescription: "Shrink JPG size with adjustable quality.", description: "Compress JPG images while controlling the balance between size and quality.", category: "Image Converter", icon: "archive", inputExtensions: ["jpg", "jpeg"], outputExtension: "jpg", quality: true },
  { id: "compress-png", name: "Compress PNG", shortDescription: "Optimize PNG files without changing format.", description: "Optimize PNG images and compare the size before and after compression.", category: "Image Converter", icon: "archive", inputExtensions: ["png"], outputExtension: "png" },
  { id: "compress-webp", name: "Compress WEBP", shortDescription: "Reduce WEBP size with quality control.", description: "Compress WEBP images with an adjustable quality setting.", category: "Image Converter", icon: "archive", inputExtensions: ["webp"], outputExtension: "webp", quality: true },
  { id: "excel-to-pdf", name: "Excel to PDF", shortDescription: "Convert XLS and XLSX spreadsheets to PDF.", description: detail("Excel", "PDF"), category: "Office Converter", icon: "sheet", inputExtensions: ["xls", "xlsx"], outputExtension: "pdf" },
  { id: "powerpoint-to-pdf", name: "PowerPoint to PDF", shortDescription: "Convert PPT and PPTX slides to PDF.", description: detail("PowerPoint", "PDF"), category: "Office Converter", icon: "slides", inputExtensions: ["ppt", "pptx"], outputExtension: "pdf" },
  { id: "txt-to-pdf", name: "TXT to PDF", shortDescription: "Turn plain text into a clean PDF.", description: detail("TXT", "PDF"), category: "Office Converter", icon: "file-text", inputExtensions: ["txt"], outputExtension: "pdf" },
  { id: "pdf-to-txt", name: "PDF to TXT", shortDescription: "Extract readable text from a PDF.", description: detail("PDF", "TXT"), category: "Office Converter", icon: "file-text", inputExtensions: ["pdf"], outputExtension: "txt" },
  { id: "merge-pdf", name: "Merge PDF", shortDescription: "Combine and reorder multiple PDF files.", description: "Merge multiple PDF files in your chosen order.", category: "PDF Tools", icon: "files", inputExtensions: ["pdf"], outputExtension: "pdf", multiple: true },
  { id: "split-pdf", name: "Split PDF", shortDescription: "Extract selected pages into separate PDFs.", description: "Split a PDF using a page range such as 1-3 or 1,3,5.", category: "PDF Tools", icon: "scissors", inputExtensions: ["pdf"], outputExtension: "zip", pageRange: true },
  { id: "compress-pdf", name: "Compress PDF", shortDescription: "Reduce PDF size with three compression levels.", description: "Compress PDF documents locally with Ghostscript.", category: "PDF Tools", icon: "archive", inputExtensions: ["pdf"], outputExtension: "pdf", compression: true },
  { id: "rotate-pdf", name: "Rotate PDF", shortDescription: "Rotate every PDF page left, right, or 180°.", description: "Rotate PDF pages and download the updated document.", category: "PDF Tools", icon: "rotate", inputExtensions: ["pdf"], outputExtension: "pdf", rotation: true },
];

export const toolMap = new Map<ToolId, ToolConfig>(tools.map((tool) => [tool.id, tool]));
export const toolIds = tools.map((tool) => tool.id);
export const categories: ToolCategory[] = ["PDF Converter", "Image Converter", "Office Converter", "PDF Tools"];
export function isToolId(value: string): value is ToolId { return toolMap.has(value as ToolId); }
