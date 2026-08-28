import Link from "next/link";
import { SearchX } from "lucide-react";
export default function NotFound() { return <div className="container-shell grid min-h-[60vh] place-items-center py-20 text-center"><div><SearchX className="mx-auto text-muted" size={58}/><p className="eyebrow mt-6">404 · Not found</p><h1 className="mt-2 text-4xl font-black">This page went missing</h1><p className="mt-3 text-muted">The tool may have moved, or the URL may be incorrect.</p><Link href="/" className="primary-button mt-7">Back to FonixsPDF</Link></div></div>; }
