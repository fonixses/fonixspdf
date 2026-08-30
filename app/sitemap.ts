import type { MetadataRoute } from "next";
import { toolIds } from "@/config/tools";
import { siteConfig } from "@/config/site";
export default function sitemap(): MetadataRoute.Sitemap { const now = new Date(); return [{ url: siteConfig.url, lastModified: now, changeFrequency: "weekly", priority: 1 }, ...toolIds.map((id) => ({ url: `${siteConfig.url}/${id}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })), ...["about", "privacy-policy", "terms", "contact", "licenses"].map((page) => ({ url: `${siteConfig.url}/${page}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 }))]; }
