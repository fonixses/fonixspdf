"use client";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { useTheme } from "@/features/theme/theme-context";

const links = [["Home", "/"], ["Convert", "/#converter"], ["PDF Tools", "/#pdf-tools"], ["Image Tools", "/#image-converter"], ["All Tools", "/#all-tools"]];
const announcements = ["Fast local conversion", "Private temporary files", "No account required", "Files deleted automatically"];
export function Header() {
  const { dark, toggle } = useTheme(); const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 border-b bg-[color:var(--card-translucent)] backdrop-blur-xl">
    <div className="running-bar" aria-label="FonixsPDF benefits">
      <div className="running-track">
        {[0, 1].map((copy) => <div className="running-group" aria-hidden={copy === 1} key={copy}>{announcements.map((item) => <span key={`${copy}-${item}`}><span className="running-dot" />{item}</span>)}</div>)}
      </div>
    </div>
    <div className="container-shell flex h-18 items-center justify-between"><Logo />
      <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">{links.map(([label, href]) => <Link key={label} href={href} className="text-sm font-semibold text-muted transition hover:text-foreground">{label}</Link>)}</nav>
      <div className="flex items-center gap-1.5"><Link href="/#tool-search" className="icon-button" aria-label="Search conversion tools" onClick={(event) => { if (window.location.pathname !== "/") return; event.preventDefault(); window.history.pushState(null, "", "/#tool-search"); const target = document.getElementById("tool-search"); target?.scrollIntoView({ behavior: "smooth", block: "center" }); target?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true }); }}><Search size={19} /></Link><button className="icon-button" onClick={toggle} aria-label={dark ? "Use light mode" : "Use dark mode"}>{dark ? <Sun size={19} /> : <Moon size={19} />}</button><button className="icon-button lg:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Open menu">{open ? <X size={21} /> : <Menu size={21} />}</button></div>
    </div>
    {open && <nav className="container-shell grid gap-1 border-t py-3 lg:hidden" aria-label="Mobile navigation">{links.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-soft">{label}</Link>)}</nav>}
  </header>;
}
