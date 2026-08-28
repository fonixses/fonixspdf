import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "FonixsPDF — Convert Files. Fast. Simple. Free.", template: "%s | FonixsPDF" },
  description: siteConfig.description,
  keywords: ["file converter", "PDF converter", "image converter", "merge PDF", "compress PDF"],
  other: { google: "notranslate" },
  openGraph: { title: "FonixsPDF", description: siteConfig.description, type: "website", locale: "en_US", siteName: "FonixsPDF" },
  twitter: { card: "summary", title: "FonixsPDF", description: siteConfig.description },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" translate="no" className="notranslate" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppProviders>
          <Header />
          <main className="min-h-[65vh]">{children}</main>
          <Footer />
          <Toaster richColors position="top-center" />
        </AppProviders>
      </body>
    </html>
  );
}
