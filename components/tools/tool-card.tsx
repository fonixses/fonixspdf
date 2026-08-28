import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ToolIcon } from "@/components/tools/tool-icon";
import type { ToolConfig } from "@/types/converter";

export function ToolCard({ tool }: { tool: ToolConfig }) {
  return <Link href={`/${tool.id}`} className="tool-card group"><span className="tool-card-icon"><ToolIcon name={tool.icon} /></span><h3 className="mt-5 font-extrabold tracking-tight">{tool.name}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{tool.shortDescription}</p><span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-brand">Open tool <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span></Link>;
}
