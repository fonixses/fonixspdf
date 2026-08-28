import { extname } from "node:path";
import { siteConfig } from "@/config/site";

const mimeByExtension: Record<string, string[]> = {
  jpg: ["image/jpeg"], jpeg: ["image/jpeg"], png: ["image/png"], webp: ["image/webp"], pdf: ["application/pdf"],
  txt: ["text/plain", "application/octet-stream"], doc: ["application/msword", "application/octet-stream"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip", "application/octet-stream"],
  xls: ["application/vnd.ms-excel", "application/octet-stream"], xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/zip", "application/octet-stream"],
  ppt: ["application/vnd.ms-powerpoint", "application/octet-stream"], pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/zip", "application/octet-stream"],
};

export function extensionOf(name: string) { return extname(name).slice(1).toLowerCase(); }
export function safeBaseName(name: string) {
  const base = name.replace(/\.[^.]+$/, "").normalize("NFKD").replace(/[^a-zA-Z0-9 _-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
  return base || "converted-file";
}
function hasSignature(buffer: Buffer, extension: string) {
  if (extension === "jpg" || extension === "jpeg") return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (extension === "png") return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (extension === "pdf") return buffer.subarray(0, 5).toString() === "%PDF-";
  if (extension === "webp") return buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
  if (["docx", "xlsx", "pptx"].includes(extension)) return buffer[0] === 0x50 && buffer[1] === 0x4b;
  if (["doc", "xls", "ppt"].includes(extension)) return buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
  if (extension === "txt") return !buffer.subarray(0, 4096).includes(0);
  return false;
}
export function validateUpload(file: File, buffer: Buffer, allowedExtensions: string[]) {
  if (!file.size || file.size > siteConfig.maxUploadBytes) throw new Error("File size exceeds the 100 MB limit.");
  const extension = extensionOf(file.name);
  if (!allowedExtensions.includes(extension)) throw new Error("Unsupported file format.");
  if (file.type && !(mimeByExtension[extension] ?? []).includes(file.type)) throw new Error("The file MIME type does not match the selected tool.");
  if (!hasSignature(buffer, extension)) throw new Error("The file signature is invalid or does not match its extension.");
  return extension;
}
