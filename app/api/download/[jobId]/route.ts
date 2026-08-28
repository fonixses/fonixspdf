import { cleanupExpiredJobs, readResult, removeJob } from "@/lib/files/temp-storage";

export const runtime = "nodejs";

function dispositionName(name: string) {
  return name.replace(/[\r\n"\\]/g, "_").replace(/[^\x20-\x7E]/g, "_").slice(0, 120);
}

export async function GET(_: Request, context: { params: Promise<{ jobId: string }> }) {
  await cleanupExpiredJobs();
  const { jobId } = await context.params;
  const result = await readResult(jobId);
  if (!result) return Response.json({ error: "This download has expired or does not exist." }, { status: 404 });
  await removeJob(jobId);
  return new Response(new Uint8Array(result.data), {
    headers: {
      "Content-Type": result.metadata.mimeType,
      "Content-Length": String(result.data.length),
      "Content-Disposition": `attachment; filename="${dispositionName(result.metadata.downloadName)}"`,
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
