import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const columns = [
  { title: "Converters", links: [["PDF to Word", "/pdf-to-word"], ["Word to PDF", "/word-to-pdf"], ["JPG to PNG", "/jpg-to-png"]] },
  { title: "Tools", links: [["Merge PDF", "/merge-pdf"], ["Compress PDF", "/compress-pdf"], ["Image Tools", "/#image-converter"]] },
  { title: "Company", links: [["About", "/about"], ["Open-source notices", "/licenses"], ["Privacy Policy", "/privacy-policy"], ["Terms", "/terms"], ["Contact", "/contact"]] },
];
export function Footer() { return <footer className="mt-24 border-t bg-card"><div className="container-shell grid gap-10 py-14 md:grid-cols-[1.4fr_2fr]"><div><Logo /><p className="mt-4 max-w-xs text-sm leading-6 text-muted">Free online file converter for PDF, documents and images. Your files stay temporary and private.</p></div><div className="grid grid-cols-2 gap-8 sm:grid-cols-3">{columns.map((column) => <div key={column.title}><h3 className="text-sm font-bold">{column.title}</h3><div className="mt-4 grid gap-3">{column.links.map(([label, href]) => <Link className="text-sm text-muted hover:text-brand" key={label} href={href}>{label}</Link>)}</div></div>)}</div></div><div className="border-t"><div className="container-shell flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between"><span>© 2026 FonixsPDF. All rights reserved.</span><span>Convert Files. Fast. Simple. Free.</span></div></div></footer>; }
