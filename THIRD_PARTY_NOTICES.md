# Third-Party Notices

FonixsPDF uses the open-source components listed below. This notice is provided for attribution and does not change the license of FonixsPDF itself. Preserve this file, the upstream copyright notices, and any `LICENSE` or `NOTICE` files included with redistributed source or binary packages.

## Runtime engines

| Component | Purpose | License | Upstream |
|---|---|---|---|
| Apache PDFBox 3.0.8 | PDF rendering and text extraction | Apache License 2.0 | <https://pdfbox.apache.org/> |
| QPDF 12.4.0 | PDF structural and image-stream optimization | Apache License 2.0 | <https://qpdf.sourceforge.io/> |
| Tesseract.js 7.0.0 | WebAssembly OCR engine | Apache License 2.0 | <https://github.com/naptha/tesseract.js> |
| Tesseract.js English data 1.0.0 | English OCR model | MIT | <https://github.com/naptha/tessdata> |
| Tesseract.js Indonesian data 1.0.0 | Indonesian OCR model | MIT | <https://github.com/naptha/tessdata> |
| LibreOffice | Office document conversion | Mozilla Public License 2.0 and other licenses disclosed by LibreOffice | <https://www.libreoffice.org/> |

Apache PDFBox includes additional notices and optional components. Its standalone JAR retains the upstream `META-INF/LICENSE` and `META-INF/NOTICE` files. QPDF's binary distribution retains its upstream documentation and notices. LibreOffice contains third-party components under multiple open-source licenses; retain the license materials supplied by the installed LibreOffice distribution.

## Direct production dependencies

Versions below reflect the lockfile at the time this notice was updated. Run `npm run licenses:check` whenever dependencies change and update this table when the resolved versions change.

| Package | Version | License | Upstream |
|---|---:|---|---|
| clsx | 2.1.1 | MIT | <https://github.com/lukeed/clsx> |
| @tesseract.js-data/eng | 1.0.0 | MIT | <https://github.com/naptha/tessdata> |
| @tesseract.js-data/ind | 1.0.0 | MIT | <https://github.com/naptha/tessdata> |
| docx | 9.7.1 | MIT | <https://docx.js.org/> |
| jszip | 3.10.1 | MIT option selected | <https://stuk.github.io/jszip/> |
| lucide-react | 0.577.0 | ISC | <https://lucide.dev/> |
| next | 16.3.2 | MIT | <https://nextjs.org/> |
| pdf-lib | 1.17.1 | MIT | <https://pdf-lib.js.org/> |
| pdfjs-dist | 6.2.108 | Apache License 2.0 | <https://mozilla.github.io/pdf.js/> |
| react | 19.2.8 | MIT | <https://react.dev/> |
| react-dom | 19.2.8 | MIT | <https://react.dev/> |
| sharp | 0.35.4 | Apache License 2.0 | <https://sharp.pixelplumbing.com/> |
| sonner | 2.0.8 | MIT | <https://sonner.emilkowal.ski/> |
| tailwind-merge | 3.6.0 | MIT | <https://github.com/dcastil/tailwind-merge> |
| tesseract.js | 7.0.0 | Apache License 2.0 | <https://github.com/naptha/tesseract.js> |
| zod | 4.4.3 | MIT | <https://zod.dev/> |

Transitive npm dependencies and their exact license files are included in their respective package distributions under `node_modules`. The complete resolved dependency graph is recorded in `package-lock.json`.

## License texts

- Apache License 2.0: <https://www.apache.org/licenses/LICENSE-2.0>
- MIT License: <https://opensource.org/license/mit>
- ISC License: <https://opensource.org/license/isc-license-txt>
- Mozilla Public License 2.0: <https://www.mozilla.org/MPL/2.0/>

FonixsPDF does not bundle or invoke Ghostscript or MuPDF.
