"use client";
import { Clock3, History } from "lucide-react";
import { useEffect, useState } from "react";
type Recent = { filename: string; output: string; timestamp: string };
export function RecentConversions() {
  const [items, setItems] = useState<Recent[]>([]);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem("fonixspdf-recent") || "[]")); } catch { /* ignore corrupt local metadata */ } }, []);
  if (!items.length) return null;
  return <section className="container-shell mt-20"><div className="mb-6 flex items-center gap-3"><span className="section-icon"><History /></span><div><p className="eyebrow">Only on this device</p><h2 className="text-2xl font-black">Recent Conversions</h2></div></div><div className="card divide-y overflow-hidden">{items.slice(0, 5).map((item, index) => <div className="flex items-center justify-between gap-4 px-5 py-4 text-sm" key={`${item.timestamp}-${index}`}><div className="min-w-0"><p className="truncate font-bold">{item.filename} <span className="text-brand">→</span> {item.output}</p><p className="mt-1 text-xs text-muted">File metadata only — original file is not stored.</p></div><span className="flex shrink-0 items-center gap-1 text-xs text-muted"><Clock3 size={13} />{new Date(item.timestamp).toLocaleDateString()}</span></div>)}</div></section>;
}
