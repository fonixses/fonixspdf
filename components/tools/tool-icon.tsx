import { Archive, FileImage, Files, FileSpreadsheet, FileText, ImageIcon, PanelsTopLeft, RotateCw, Scissors } from "lucide-react";
import type { ToolIcon as ToolIconName } from "@/types/converter";

const icons = { image: ImageIcon, "file-image": FileImage, "file-text": FileText, files: Files, scissors: Scissors, rotate: RotateCw, archive: Archive, sheet: FileSpreadsheet, slides: PanelsTopLeft };
export function ToolIcon({ name, size = 22 }: { name: ToolIconName; size?: number }) { const Icon = icons[name]; return <Icon size={size} />; }
