import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Open-source notices" };

export default function LicensesPage() {
  return <LegalPage
    eyebrow="Licenses"
    title="Open-source notices"
    intro="FonixsPDF is built with open-source engines and libraries. Their licenses remain with their respective authors."
    sections={[
      { title: "PDF engines", body: <>Apache PDFBox, QPDF, PDF.js, and Tesseract.js are used under the Apache License 2.0. PDF structure editing and bundled OCR language data use MIT-licensed components.</> },
      { title: "Documents and images", body: <>LibreOffice is distributed under MPL 2.0 and additional disclosed licenses. Sharp is used under Apache 2.0. Preserve the license and notice files shipped with these components.</> },
      { title: "Complete notice", body: <>The source distribution includes <code>THIRD_PARTY_NOTICES.md</code> with resolved versions, upstream links, and license references. Deployment operators must keep that notice current when dependencies change.</> },
      { title: "No paid conversion API", body: <>Conversion runs with locally installed open-source software. FonixsPDF does not bundle or invoke Ghostscript or MuPDF. See the <Link className="font-bold text-brand" href="/about">About page</Link> for the processing overview.</> },
    ]}
  />;
}
