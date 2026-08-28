"use client";

import { ThemeProvider } from "@/features/theme/theme-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
