"use client";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ToolIcon } from "@/components/tools/tool-icon";
import { tools } from "@/config/tools";

export function ToolSearch() {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const focusFromHash = () => {
      if (window.location.hash !== "#tool-search") return;
      window.requestAnimationFrame(() => {
        document.getElementById("tool-search")?.scrollIntoView({ behavior: "smooth", block: "center" });
        input.current?.focus({ preventScroll: true });
      });
    };
    focusFromHash();
    window.addEventListener("hashchange", focusFromHash);
    return () => window.removeEventListener("hashchange", focusFromHash);
  }, []);
  const results = useMemo(() => query.trim() ? tools.filter((tool) => `${tool.name} ${tool.category} ${tool.inputExtensions.join(" ")}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8) : [], [query]);
  return <div id="tool-search" className="relative mx-auto max-w-2xl scroll-mt-32"><div className="search-box"><Search className="text-brand" size={21} /><input ref={input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="What do you want to convert?" aria-label="Search tools" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={18} /></button>}</div>{query && <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border bg-card p-2 shadow-2xl">{results.length ? results.map((tool) => <Link key={tool.id} href={`/${tool.id}`} className="flex items-center gap-3 rounded-xl p-3 hover:bg-soft"><span className="grid size-9 place-items-center rounded-lg bg-brand-soft text-brand"><ToolIcon name={tool.icon} size={18} /></span><span><b className="block text-sm">{tool.name}</b><span className="text-xs text-muted">{tool.category}</span></span></Link>) : <p className="p-4 text-center text-sm text-muted">No matching tools found.</p>}</div>}</div>;
}
