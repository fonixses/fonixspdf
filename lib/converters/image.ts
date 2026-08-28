import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import type { ConversionOutput, ConverterOptions } from "@/types/converter";

const mime: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function convertImage(input: Buffer, output: "jpg" | "png" | "webp", baseName: string, options: ConverterOptions = {}): Promise<ConversionOutput> {
  const quality = Math.min(100, Math.max(10, options.quality ?? 82));
  const pipeline = sharp(input, { failOn: "error" }).rotate();
  let data: Buffer;
  if (output === "jpg") data = await pipeline.flatten({ background: "#ffffff" }).jpeg({ quality, mozjpeg: true }).toBuffer();
  else if (output === "webp") data = await pipeline.webp({ quality, effort: 5 }).toBuffer();
  else data = await pipeline.png({ compressionLevel: 9, palette: false }).toBuffer();
  return { data, fileName: `${baseName}.${output}`, mimeType: mime[output] };
}

export async function imagesToPdf(inputs: Buffer[], baseName: string, options: ConverterOptions = {}): Promise<ConversionOutput> {
  const document = await PDFDocument.create();
  const rotations = options.fileRotations ?? [];
  for (let index = 0; index < inputs.length; index++) {
    const rotation = ((rotations[index] ?? 0) % 360 + 360) % 360;
    const normalized = await sharp(inputs[index]).rotate(rotation).flatten({ background: "#ffffff" }).png().toBuffer();
    const metadata = await sharp(normalized).metadata();
    const image = await document.embedPng(normalized);
    const imageWidth = metadata.width ?? image.width;
    const imageHeight = metadata.height ?? image.height;
    let width: number; let height: number;
    if (options.pageSize === "fit") { width = imageWidth * 0.75; height = imageHeight * 0.75; }
    else {
      const dimensions = options.pageSize === "letter" ? [612, 792] : [595.28, 841.89];
      [width, height] = options.orientation === "landscape" ? [dimensions[1], dimensions[0]] : dimensions;
    }
    const page = document.addPage([width, height]);
    const margin = options.pageSize === "fit" ? 0 : 28;
    const scale = Math.min((width - margin * 2) / image.width, (height - margin * 2) / image.height);
    const drawWidth = image.width * scale; const drawHeight = image.height * scale;
    page.drawImage(image, { x: (width - drawWidth) / 2, y: (height - drawHeight) / 2, width: drawWidth, height: drawHeight });
  }
  return { data: Buffer.from(await document.save()), fileName: `${baseName}.pdf`, mimeType: "application/pdf" };
}
