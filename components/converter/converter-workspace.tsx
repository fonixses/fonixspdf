"use client";
import Image from "next/image";
import { ArrowDownToLine, Check, ChevronDown, File, GripVertical, LoaderCircle, RefreshCw, RotateCw, Trash2, XCircle } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { FileUploader } from "@/components/upload/file-uploader";
import { PdfThumbnail } from "@/components/converter/pdf-thumbnail";
import type { ToolConfig } from "@/types/converter";

type Selected = { id: string; file: File; preview: string; rotation: number };
type Result = { downloadUrl: string; downloadName: string; originalSize: number; resultSize: number };
interface Props { tool?: ToolConfig; universal?: boolean; compact?: boolean }

const extension = (name: string) => name.split(".").pop()?.toLowerCase() || "";
const formatSize = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`;
const outputs: Record<string, string[]> = { jpg: ["png", "webp", "pdf"], jpeg: ["png", "webp", "pdf"], png: ["jpg", "webp", "pdf"], webp: ["jpg", "png"], pdf: ["docx", "jpg", "png", "txt"], doc: ["pdf"], docx: ["pdf"], xls: ["pdf"], xlsx: ["pdf"], ppt: ["pdf"], pptx: ["pdf"], txt: ["pdf"] };

export function ConverterWorkspace({ tool, universal, compact }: Props) {
  const [files, setFiles] = useState<Selected[]>([]); const [output, setOutput] = useState("");
  const [quality, setQuality] = useState(80); const [pageSize, setPageSize] = useState("a4"); const [orientation, setOrientation] = useState("portrait");
  const [compression, setCompression] = useState("recommended"); const [range, setRange] = useState("1-3"); const [rotation, setRotation] = useState(90);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle"); const [progress, setProgress] = useState(0); const [error, setError] = useState(""); const [result, setResult] = useState<Result | null>(null);
  const dragged = useRef<number | null>(null);
  const inputExtension = files[0] ? extension(files[0].file.name) : "";
  const outputOptions = useMemo(() => outputs[inputExtension] ?? [], [inputExtension]);
  const accepted = tool ? tool.inputExtensions.map((item) => `.${item}`).join(",") : ".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt";

  const addFiles = (incoming: File[]) => {
    const max = 100 * 1024 * 1024;
    const valid = incoming.filter((file) => { const ext = extension(file.name); const permitted = tool ? tool.inputExtensions.includes(ext) : Boolean(outputs[ext]); if (!permitted) toast.error(`${file.name}: unsupported format`); else if (file.size > max) toast.error(`${file.name}: exceeds 100 MB`); return permitted && file.size <= max; });
    if (!valid.length) return;
    const selected = valid.map((file) => ({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), rotation: 0 }));
    setFiles((current) => { if (tool?.multiple) return [...current, ...selected].slice(0, 100); current.forEach((item) => URL.revokeObjectURL(item.preview)); return [selected[0]]; });
    if (universal) setOutput((outputs[extension(valid[0].name)] ?? [])[0] ?? "");
    setStatus("idle"); setResult(null); setError("");
  };
  const remove = (index: number) => setFiles((current) => { URL.revokeObjectURL(current[index].preview); return current.filter((_, item) => item !== index); });
  const reset = () => { files.forEach((item) => URL.revokeObjectURL(item.preview)); setFiles([]); setStatus("idle"); setResult(null); setProgress(0); setError(""); };
  const reorder = (from: number, to: number) => setFiles((current) => { const next = [...current]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next; });
  const rotateFile = (index: number) => setFiles((current) => current.map((item, position) => position === index ? { ...item, rotation: item.rotation + 90 } : item));

  const convert = async () => {
    if (!files.length || (universal && !output)) return;
    setStatus("processing"); setProgress(8); setError("");
    const timer = window.setInterval(() => setProgress((value) => Math.min(91, value + Math.max(1, Math.round((92 - value) / 8)))), 280);
    try {
      const body = new FormData(); files.forEach((item) => body.append("files", item.file)); body.append("tool", universal ? "universal" : tool!.id);
      body.append("options", JSON.stringify({ outputFormat: universal ? output : undefined, quality, pageSize, orientation, compression, pageRange: range, rotation, fileRotations: files.map((item) => item.rotation) }));
      const response = await fetch("/api/convert", { method: "POST", body }); const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Conversion failed.");
      setProgress(100); setResult(payload.result); setStatus("done");
      const recent = JSON.parse(localStorage.getItem("fonixspdf-recent") || "[]") as object[];
      localStorage.setItem("fonixspdf-recent", JSON.stringify([{ filename: files[0].file.name, output: payload.result.downloadName, timestamp: new Date().toISOString() }, ...recent].slice(0, 8)));
    } catch (failure) { setStatus("error"); setError(failure instanceof Error ? failure.message : "Conversion failed."); }
    finally { window.clearInterval(timer); }
  };

  if (status === "done" && result) return <ResultView result={result} reset={reset} />;
  return <div className={`converter-panel ${compact ? "p-4 sm:p-6" : "p-5 sm:p-8"}`}>
    {!files.length ? <FileUploader accept={accepted} multiple={tool?.multiple} onFiles={addFiles} /> : <>
      <div className="flex items-center justify-between gap-3"><div><p className="eyebrow">File information</p><h2 className="mt-1 text-lg font-extrabold">{universal ? `Convert ${inputExtension.toUpperCase()} to` : tool?.name}</h2></div><button type="button" onClick={reset} className="text-button">Clear all</button></div>
      <div className={`mt-5 grid gap-3 ${tool?.multiple ? "sm:grid-cols-2" : ""}`}>{files.map((item, index) => <FileCard key={item.id} item={item} index={index} reorderable={Boolean(tool?.multiple)} canRotate={Boolean(tool?.pageOptions)} onRemove={() => remove(index)} onRotate={() => rotateFile(index)} onDrag={() => { dragged.current = index; }} onDrop={() => { if (dragged.current !== null && dragged.current !== index) reorder(dragged.current, index); dragged.current = null; }} />)}</div>
      {tool?.multiple && <div className="mt-4"><FileUploader accept={accepted} multiple compact onFiles={addFiles} /></div>}
      <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2">
        {universal && <Field label="Output format"><select value={output} onChange={(event) => setOutput(event.target.value)}>{outputOptions.map((item) => <option value={item} key={item}>{item.toUpperCase()}</option>)}</select></Field>}
        {tool?.quality && <Field label={`Quality: ${quality}%`}><input type="range" min="50" max="100" step="10" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /></Field>}
        {tool?.pageOptions && <><Field label="Page size"><select value={pageSize} onChange={(event) => setPageSize(event.target.value)}><option value="a4">A4</option><option value="letter">Letter</option><option value="fit">Fit image</option></select></Field><Field label="Orientation"><select value={orientation} onChange={(event) => setOrientation(event.target.value)}><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></Field></>}
        {tool?.compression && <Field label="Compression"><select value={compression} onChange={(event) => setCompression(event.target.value)}><option value="low">Low compression</option><option value="recommended">Recommended</option><option value="high">High compression</option></select></Field>}
        {tool?.pageRange && <Field label="Page range"><input value={range} onChange={(event) => setRange(event.target.value)} placeholder="1-3 or 1,3,5" /></Field>}
        {tool?.rotation && <Field label="Rotate pages"><select value={rotation} onChange={(event) => setRotation(Number(event.target.value))}><option value="-90">90° left</option><option value="90">90° right</option><option value="180">180°</option></select></Field>}
      </div>
      {status === "processing" ? <Processing progress={progress} /> : <button type="button" onClick={convert} disabled={universal && !output} className="primary-button mt-6 w-full justify-center py-4">Convert {universal ? `to ${output.toUpperCase()}` : tool?.outputExtension.toUpperCase()} <ChevronDown className="-rotate-90" size={18} /></button>}
      {status === "error" && <div className="mt-5 flex items-start gap-3 rounded-2xl bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300"><XCircle className="mt-0.5 shrink-0" size={18} /><span>{error}</span></div>}
    </>}
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="field"><span>{label}</span>{children}</label>; }
function FileCard({ item, index, reorderable, canRotate, onRemove, onRotate, onDrag, onDrop }: { item: Selected; index: number; reorderable: boolean; canRotate: boolean; onRemove: () => void; onRotate: () => void; onDrag: () => void; onDrop: () => void }) {
  const ext = extension(item.file.name); const image = ["jpg", "jpeg", "png", "webp"].includes(ext);
  return <div draggable={reorderable} onDragStart={onDrag} onDragOver={(event) => event.preventDefault()} onDrop={onDrop} className="file-card"><div className="flex min-w-0 items-center gap-3">{reorderable && <GripVertical className="shrink-0 cursor-grab text-muted" size={18} />}<div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-soft">{image ? <Image src={item.preview} alt="" fill unoptimized className="object-cover" style={{ transform: `rotate(${item.rotation}deg)` }} /> : ext === "pdf" ? <PdfThumbnail file={item.file} /> : <File className="text-brand" />}</div><div className="min-w-0"><p className="truncate text-sm font-bold">{index + 1}. {item.file.name}</p><p className="mt-1 text-xs text-muted">{ext.toUpperCase()} · {formatSize(item.file.size)}</p></div></div><div className="flex shrink-0">{canRotate && <button type="button" className="mini-button" onClick={onRotate} aria-label="Rotate image"><RotateCw size={16} /></button>}<button type="button" className="mini-button text-red-500" onClick={onRemove} aria-label="Remove file"><Trash2 size={16} /></button></div></div>;
}
function Processing({ progress }: { progress: number }) {
  const stage = progress < 30 ? "Preparing file..." : progress < 75 ? "Converting..." : progress < 100 ? "Optimizing..." : "Completed";
  return <div className="mt-6 rounded-2xl bg-brand-soft p-5"><div className="flex items-center gap-3"><LoaderCircle className="animate-spin text-brand" /><div className="flex-1"><div className="flex justify-between text-sm font-bold"><span>Converting your file...</span><span>{progress}%</span></div><p className="mt-1 text-xs text-muted">{stage}</p></div></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${progress}%` }} /></div></div>;
}
function ResultView({ result, reset }: { result: Result; reset: () => void }) {
  const saved = result.originalSize ? Math.max(0, Math.round((1 - result.resultSize / result.originalSize) * 100)) : 0;
  return <div className="converter-panel p-6 text-center sm:p-10"><span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_14px_34px_rgba(16,185,129,.25)]"><Check size={32} strokeWidth={3} /></span><p className="eyebrow mt-6">Conversion completed</p><h2 className="mt-2 text-2xl font-black">Your File is Ready!</h2><div className="mx-auto mt-6 max-w-md rounded-2xl border bg-soft p-5 text-left"><p className="truncate font-bold">{result.downloadName}</p><div className="mt-3 grid grid-cols-3 gap-3 text-xs text-muted"><span>Original<br/><b className="text-foreground">{formatSize(result.originalSize)}</b></span><span>Result<br/><b className="text-foreground">{formatSize(result.resultSize)}</b></span><span>Saved<br/><b className="text-foreground">{saved}%</b></span></div></div><a href={result.downloadUrl} className="primary-button mt-6 w-full max-w-md justify-center py-4"><ArrowDownToLine size={20} /> Download File</a><button type="button" onClick={reset} className="text-button mt-5"><RefreshCw size={16} /> Convert Another File</button></div>;
}
