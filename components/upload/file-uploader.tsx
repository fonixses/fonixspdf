"use client";
import { FileUp, LockKeyhole } from "lucide-react";
import { useRef, useState } from "react";

interface FileUploaderProps { accept?: string; multiple?: boolean; compact?: boolean; onFiles: (files: File[]) => void }
export function FileUploader({ accept, multiple, compact, onFiles }: FileUploaderProps) {
  const input = useRef<HTMLInputElement>(null); const [dragging, setDragging] = useState(false);
  const receive = (list: FileList | null) => { if (list?.length) onFiles(Array.from(list)); };
  return <div>
    <button type="button" onClick={() => input.current?.click()} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); receive(event.dataTransfer.files); }} className={`upload-zone ${compact ? "upload-zone-compact" : ""} ${dragging ? "upload-zone-active" : ""}`}>
      {compact ? <><FileUp size={20} className="text-brand"/><span className="font-bold">Add more files</span><span className="text-xs text-muted">or drop them here</span></> : <><span className="upload-icon"><FileUp size={30} /></span><span className="mt-5 text-lg font-extrabold">Drop your {multiple ? "files" : "file"} here</span><span className="mt-1 text-sm text-muted">or click to browse from your device</span><span className="primary-button mt-6 pointer-events-none">Select {multiple ? "Files" : "File"}</span></>}
    </button>
    <input ref={input} type="file" accept={accept} multiple={multiple} className="sr-only" onChange={(event) => { receive(event.target.files); event.target.value = ""; }} />
    {!compact && <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted"><LockKeyhole size={14} className="text-emerald-500" />Secure processing · 100 MB limit · Auto-deleted within 60 minutes</p>}
  </div>;
}
