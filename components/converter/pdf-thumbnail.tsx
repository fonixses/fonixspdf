"use client";
import { FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PDFDocumentLoadingTask } from "pdfjs-dist";

export function PdfThumbnail({ file }: { file: File }) {
  const canvas = useRef<HTMLCanvasElement>(null); const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true; let loadingTask: PDFDocumentLoadingTask | undefined;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        const data = new Uint8Array(await file.arrayBuffer()); loadingTask = pdfjs.getDocument({ data });
        const pdf = await loadingTask.promise; if (!active || !canvas.current) return;
        const page = await pdf.getPage(1); const initial = page.getViewport({ scale: 1 }); const viewport = page.getViewport({ scale: Math.min(1.5, 120 / initial.width) });
        canvas.current.width = viewport.width; canvas.current.height = viewport.height;
        await page.render({ canvas: canvas.current, viewport, background: "#ffffff" }).promise;
      } catch { if (active) setFailed(true); }
    })();
    return () => { active = false; void loadingTask?.destroy(); };
  }, [file]);
  if (failed) return <FileText className="text-brand" />;
  return <canvas ref={canvas} className="h-full w-full object-cover" aria-label={`First page preview of ${file.name}`} />;
}
