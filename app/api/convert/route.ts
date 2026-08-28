import { z } from "zod";
import { isToolId, toolMap, tools } from "@/config/tools";
import { runConversion, resolveUniversalTool } from "@/lib/converters";
import { extensionOf, safeBaseName, validateUpload } from "@/lib/files/security";
import { cleanupExpiredJobs, createJob, removeJob, storeResult, writeInput } from "@/lib/files/temp-storage";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 120;

const optionsSchema = z.object({
  quality: z.number().int().min(10).max(100).optional(),
  pageSize: z.enum(["a4", "letter", "fit"]).optional(),
  orientation: z.enum(["portrait", "landscape"]).optional(),
  compression: z.enum(["low", "recommended", "high"]).optional(),
  pageRange: z.string().max(200).optional(),
  rotation: z.union([z.literal(90), z.literal(-90), z.literal(180)]).optional(),
  fileRotations: z.array(z.number().int().min(-1080).max(1080)).max(100).optional(),
  outputFormat: z.string().regex(/^[a-z0-9]+$/).optional(),
});

export async function POST(request: Request) {
  const client = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!checkRateLimit(client)) return Response.json({ error: "Too many conversion requests. Please try again in a few minutes." }, { status: 429 });
  await cleanupExpiredJobs();
  let job: Awaited<ReturnType<typeof createJob>> | null = null;
  try {
    const form = await request.formData();
    const uploads = form.getAll("files").filter((entry): entry is File => entry instanceof File);
    if (!uploads.length) throw new Error("Please choose at least one file.");
    if (uploads.reduce((total, file) => total + file.size, 0) > 100 * 1024 * 1024) throw new Error("File size exceeds the 100 MB limit.");
    const rawOptions = form.get("options");
    const options = optionsSchema.parse(rawOptions ? JSON.parse(String(rawOptions)) : {});
    const requested = String(form.get("tool") ?? "");
    let toolId = isToolId(requested) ? requested : null;
    if (requested === "universal") toolId = resolveUniversalTool(extensionOf(uploads[0].name), options.outputFormat ?? "");
    if (!toolId) throw new Error("This input and output format combination is not supported.");
    const tool = toolMap.get(toolId)!;
    if (!tool.multiple && uploads.length > 1) throw new Error("This tool accepts one file at a time.");
    if (uploads.length > 100) throw new Error("A maximum of 100 files can be processed at once.");
    job = await createJob();
    const inputs = [];
    for (const upload of uploads) {
      const buffer = Buffer.from(await upload.arrayBuffer());
      const extension = validateUpload(upload, buffer, tool.inputExtensions);
      inputs.push({ buffer, extension, baseName: safeBaseName(upload.name), path: await writeInput(job.directory, buffer, extension) });
    }
    const output = await runConversion(toolId, inputs, job.directory, options);
    return Response.json({ ok: true, tool: toolId, result: await storeResult(job.id, job.directory, output, uploads.reduce((sum, file) => sum + file.size, 0)) });
  } catch (error) {
    if (job) await removeJob(job.id);
    const message = error instanceof z.ZodError ? "Invalid conversion options." : error instanceof SyntaxError ? "Invalid conversion options." : error instanceof Error ? error.message : "Conversion failed.";
    const status = /size|format|signature|range|choose|accepts|combination|options/i.test(message) ? 400 : 500;
    return Response.json({ error: message }, { status });
  }
}

export async function GET() {
  return Response.json({ tools: tools.map(({ id, name, inputExtensions, outputExtension }) => ({ id, name, inputExtensions, outputExtension })) });
}
