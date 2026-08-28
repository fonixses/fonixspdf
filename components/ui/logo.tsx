import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="focus-ring inline-flex items-center gap-2.5 rounded-lg" aria-label="FonixsPDF home">
    <span className="relative grid size-9 place-items-center rounded-xl bg-brand text-sm font-black text-white shadow-[0_8px_24px_rgba(14,165,233,.28)]"><span className="absolute right-0 top-0 size-3 rounded-bl-md border-b border-l border-white/40 bg-white/20" />F</span>
    {!compact && <span className="text-[1.15rem] font-extrabold tracking-[-0.04em]">Fonixs<span className="text-brand">PDF</span></span>}
  </Link>;
}
