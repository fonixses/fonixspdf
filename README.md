# FonixsPDF

**Convert Files. Fast. Simple. Free.**

FonixsPDF is a self-hostable online converter for PDF, Office documents, and images. It uses open-source libraries and local command-line engines—never a paid conversion API. The main workflow is intentionally short: upload, convert, download.

## Features

- Universal converter with automatic input detection
- Drag-and-drop upload, file information, progress, and result states
- Multi-file ordering, image preview, rotation, deletion, and page settings
- Image conversion and compression powered by Sharp
- PDF creation, merge, split, and rotation powered by pdf-lib
- PDF rendering, text extraction, and compression powered by Ghostscript
- Office-to-PDF conversion powered by LibreOffice headless
- PDF-to-DOCX text extraction and editable document generation
- One-time downloads and automatic temporary-file cleanup after 60 minutes
- UUID internal filenames, MIME/extension/signature checks, a 100 MB request limit, and basic rate limiting
- Responsive layout, persisted dark mode, tool search, local recent-conversion metadata, sitemap, and per-tool SEO metadata

## Supported tools

| Category | Tools |
|---|---|
| PDF converter | PDF to Word, Word to PDF, PDF to JPG, JPG to PDF, PDF to PNG, PNG to PDF |
| Image converter | JPG to PNG, PNG to JPG, WEBP to JPG, JPG to WEBP, PNG to WEBP, WEBP to PNG |
| Image compression | Compress JPG, Compress PNG, Compress WEBP |
| Office converter | Excel to PDF, PowerPoint to PDF, TXT to PDF, PDF to TXT |
| PDF tools | Merge PDF, Split PDF, Compress PDF, Rotate PDF |

PDF-to-JPG/PNG and split-PDF results are returned as ZIP files when they contain multiple files. PDF-to-Word creates an editable DOCX from extractable PDF text; it does not reproduce complex layout or OCR scanned pages.

## Tech stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4
- Sharp, pdf-lib, JSZip, docx
- Ghostscript and LibreOffice headless
- Lucide React and Sonner

No database, user account, or paid API is required.

## System dependencies

Install the native conversion engines before starting the app:

```bash
sudo apt update
sudo apt install libreoffice ghostscript qpdf
```

Ghostscript is required for PDF rendering, compression, and text extraction. LibreOffice is required for DOC/DOCX, XLS/XLSX, and PPT/PPTX to PDF. qpdf is recommended for diagnostics and future encrypted-PDF handling; current merge/split/rotate operations use pdf-lib.

On macOS, install equivalents with Homebrew:

```bash
brew install ghostscript qpdf
brew install --cask libreoffice
```

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The default temporary directory is `./temp`. To use another writable location, set `FONIXS_TEMP_DIR` to an absolute path.

## Development

```bash
npm run dev
npm run typecheck
npm run lint
```

Create a small test image with ImageMagick or another local utility, then exercise a real route such as `/jpg-to-png`. API conversion requests use `multipart/form-data` with `files`, `tool`, and a JSON `options` field.

To remove jobs older than 60 minutes manually:

```bash
npm run cleanup
```

Cleanup also runs opportunistically on conversion and download requests. In production, schedule `npm run cleanup` every 10–30 minutes for guaranteed cleanup during periods with no traffic.

## Production

```bash
npm run build
npm start
```

Set `NEXT_PUBLIC_SITE_URL` to the public HTTPS origin. Give the Node.js user write permission only to the configured temporary directory. Place the app behind a reverse proxy that enforces request/body limits, rate limits, TLS, timeouts, and security headers.

Serverless platforms often impose body-size, execution-time, ephemeral-storage, and native-binary restrictions. A Node.js server or container with Ghostscript and LibreOffice installed is the recommended deployment target.

## Security model

1. The browser sends files to the conversion endpoint.
2. The server checks the total size, tool-specific extension, reported MIME type, and file signature.
3. Files are written to a UUID job directory with UUID internal filenames. The original filename is used only to derive a sanitized download name.
4. Native tools are invoked with `execFile` argument arrays. No user string is interpolated into a shell command.
5. The result is offered through an unguessable UUID download URL.
6. The result directory is deleted after the first successful download, or by cleanup after 60 minutes.

For public deployment, also use malware scanning, container resource limits, an external rate limiter, request limits at the proxy, isolated worker processes, and observability that never records file contents.

## Project structure

```text
app/
  [tool]/                 SEO pages for every converter
  api/convert/            upload validation and conversion orchestration
  api/download/[jobId]/   one-time result download
components/
  converter/              conversion workflow and states
  upload/                 reusable drag-and-drop uploader
  tools/                  tool cards and icons
config/                   branding and tool registry
lib/
  converters/             image, PDF, and Office engines
  files/                  validation and temporary storage
scripts/                  cleanup utilities
temp/                     ignored runtime job storage
types/                    shared converter types
```

## Conversion dependencies

- `convertImage()` / compression: Sharp
- `imagesToPdf()`, `mergePdf()`, `splitPdf()`, `rotatePdf()`, `textToPdf()`: pdf-lib
- `pdfToImages()`, `compressPdf()`, PDF text extraction: Ghostscript
- `officeToPdf()`: LibreOffice headless
- Multi-result archives: JSZip
- Extracted-text DOCX output: docx

## Known limits

- Scanned PDFs need OCR, which is not included.
- PDF-to-Word prioritizes editable extracted text, not pixel-perfect layout.
- Password-protected or malformed files may be rejected by the conversion engine.
- Browser progress is staged while the server processes a request; the current API does not stream byte-level conversion progress.
- In-memory rate limiting is per Node.js process. Use Redis or proxy-level limiting for multi-instance deployments.

## License and third-party software

Add your chosen project license before redistribution. Verify the licenses and redistribution requirements of Ghostscript, LibreOffice, and npm dependencies for your deployment model.
