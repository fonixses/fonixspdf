import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, LockKeyhole, ServerCog, TimerReset } from "lucide-react";
import { ConverterWorkspace } from "@/components/converter/converter-workspace";
import { ToolCard } from "@/components/tools/tool-card";
import { isToolId, toolIds, toolMap, tools } from "@/config/tools";

export function generateStaticParams() { return toolIds.map((tool) => ({ tool })); }
export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> { const { tool: id } = await params; if (!isToolId(id)) return {}; const tool = toolMap.get(id)!; return { title: `${tool.name} Converter`, description: `${tool.description} No account required. Files are automatically deleted.`, alternates: { canonical: `/${tool.id}` } }; }
export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool: id } = await params; if (!isToolId(id)) notFound(); const tool = toolMap.get(id)!; const related = tools.filter((item) => item.category === tool.category && item.id !== tool.id).slice(0, 4);
  return <><section className="tool-hero"><div className="container-shell py-12 sm:py-16"><nav className="mb-7 flex items-center gap-2 text-xs text-muted"><Link href="/">Home</Link><ChevronRight size={13}/><Link href={`/#${tool.category.toLowerCase().replace(" ", "-")}`}>{tool.category}</Link><ChevronRight size={13}/><span className="text-foreground">{tool.name}</span></nav><div className="mx-auto max-w-3xl text-center"><p className="eyebrow">Free online converter</p><h1 className="mt-3 text-4xl font-black tracking-[-.045em] sm:text-5xl">{tool.name} Converter</h1><p className="mx-auto mt-4 max-w-2xl leading-7 text-muted">{tool.description}</p></div><div className="mx-auto mt-9 max-w-3xl"><ConverterWorkspace tool={tool} /></div><div className="mx-auto mt-7 grid max-w-3xl gap-3 text-xs text-muted sm:grid-cols-3"><span className="trust-pill"><LockKeyhole size={15}/>Secure temporary files</span><span className="trust-pill"><TimerReset size={15}/>Deleted within 60 min</span><span className="trust-pill"><ServerCog size={15}/>Open-source processing</span></div></div></section>{related.length > 0 && <section className="container-shell mt-20"><p className="eyebrow">Keep working</p><h2 className="mt-2 text-2xl font-black">Related tools</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{related.map((item) => <ToolCard key={item.id} tool={item}/>)}</div></section>}</>;
}
