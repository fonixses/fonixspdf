import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";
export const metadata: Metadata = { title: "Contact" };
export default function ContactPage() { return <LegalPage eyebrow="Contact" title="Talk to FonixsPDF" intro="Questions, deployment feedback, or a conversion issue? Send us a concise report." sections={[{ title: "Email", body: <a className="font-bold text-brand" href="mailto:hello@fonixspdf.com">hello@fonixspdf.com</a> }, { title: "Helpful details", body: <>Include the tool name, input format, approximate file size, operating system, and the exact error message. Never email confidential source files.</> }]} />; }
