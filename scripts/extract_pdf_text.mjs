import fs from 'fs';
import path from 'path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const pdfPath = process.argv[2];
if (!pdfPath) {
  console.error('usage: node scripts/extract_pdf_text.mjs <pdf>');
  process.exit(1);
}

const data = new Uint8Array(fs.readFileSync(pdfPath));
const loadingTask = getDocument({ data, useSystemFonts: true, disableFontFace: true });
const pdf = await loadingTask.promise;
let out = '';
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const tc = await page.getTextContent();
  const items = tc.items.map((it) => it.str);
  out += `\n\n===PAGE ${i}===\n` + items.join('\n');
}
console.log(out);
