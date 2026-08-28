export type ToolCategory = "PDF Converter" | "Image Converter" | "Office Converter" | "PDF Tools";

export type ToolId =
  | "jpg-to-png" | "png-to-jpg" | "webp-to-jpg" | "jpg-to-webp" | "png-to-webp" | "webp-to-png"
  | "compress-jpg" | "compress-png" | "compress-webp"
  | "jpg-to-pdf" | "png-to-pdf" | "pdf-to-jpg" | "pdf-to-png"
  | "word-to-pdf" | "pdf-to-word" | "excel-to-pdf" | "powerpoint-to-pdf" | "txt-to-pdf" | "pdf-to-txt"
  | "merge-pdf" | "split-pdf" | "compress-pdf" | "rotate-pdf";

export type ToolIcon = "image" | "file-image" | "file-text" | "files" | "scissors" | "rotate" | "archive" | "sheet" | "slides";

export interface ToolConfig {
  id: ToolId;
  name: string;
  shortDescription: string;
  description: string;
  category: ToolCategory;
  icon: ToolIcon;
  inputExtensions: string[];
  outputExtension: string;
  multiple?: boolean;
  quality?: boolean;
  pageOptions?: boolean;
  compression?: boolean;
  pageRange?: boolean;
  rotation?: boolean;
}

export interface ConverterOptions {
  quality?: number;
  pageSize?: "a4" | "letter" | "fit";
  orientation?: "portrait" | "landscape";
  compression?: "low" | "recommended" | "high";
  pageRange?: string;
  rotation?: 90 | -90 | 180;
  fileRotations?: number[];
  outputFormat?: string;
}

export interface ConversionOutput {
  data: Buffer;
  fileName: string;
  mimeType: string;
}
