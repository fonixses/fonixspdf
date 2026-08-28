export const siteConfig = {
  name: "FonixsPDF",
  tagline: "Convert Files. Fast. Simple. Free.",
  description: "Free online file converter for PDF, documents and images.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "hello@fonixspdf.com",
  maxUploadBytes: 100 * 1024 * 1024,
  retentionMinutes: 60,
} as const;
