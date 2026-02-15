import fs from 'fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const QA_CSV = 'data/short_answer_qa.csv';
const OUT_JSON = 'data/short_answer_quiz_items.json';

const toHalf = (s) => s.normalize('NFKC').replace(/　/g, ' ');

async function loadPdfItems(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await getDocument({ data, useSystemFonts: true, disableFontFace: true }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    pages.push(tc.items.map((it) => ({ str: it.str || '', x: it.transform[4], y: it.transform[5] })));
  }
  return pages;
}

function itemsToLines(pageItems) {
  const rows = new Map();
  for (const it of pageItems) {
    const str = it.str.trim();
    if (!str) continue;
    const key = Math.round(it.y * 2) / 2;
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push({ x: it.x, str });
  }
  const sortedY = [...rows.keys()].sort((a, b) => b - a);
  const lines = [];
  for (const y of sortedY) {
    const row = rows.get(y).sort((a, b) => a.x - b.x);
    let line = '';
    let prevX = null;
    for (const token of row) {
      if (prevX !== null && token.x - prevX > 20) line += ' ';
      line += token.str;
      prevX = token.x + token.str.length * 6;
    }
    lines.push(line.replace(/\s+/g, ' ').trim());
  }
  return lines;
}

function parseAnswerMapFromPages(pages) {
  const map = new Map();
  for (const pageItems of pages) {
    const noHeaders = pageItems.filter((it) => toHalf(it.str).trim() === 'No').sort((a, b) => a.x - b.x);
    const ansHeaders = pageItems.filter((it) => toHalf(it.str).trim() === '解答').sort((a, b) => a.x - b.x);
    const leftNoX = noHeaders[0]?.x ?? 146;
    const rightNoX = noHeaders[1]?.x ?? 333;
    const leftAnsX = ansHeaders[0]?.x ?? (leftNoX + 30);
    const rightAnsX = ansHeaders[1]?.x ?? (rightNoX + 30);

    const rows = new Map();
    for (const it of pageItems) {
      const txt = toHalf(it.str).trim();
      if (!/^\d+$/.test(txt)) continue;
      const key = Math.round(it.y * 2) / 2;
      if (!rows.has(key)) rows.set(key, []);
      rows.get(key).push({ x: it.x, n: Number(txt) });
    }

    for (const tokens of rows.values()) {
      const t = tokens.sort((a, b) => a.x - b.x);
      const pickNear = (x, tol, nmin, nmax) =>
        t
          .filter((v) => Math.abs(v.x - x) <= tol && v.n >= nmin && v.n <= nmax)
          .sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0]?.n;
      const leftNo = pickNear(leftNoX, 10, 1, 200);
      const leftAns = pickNear(leftAnsX, 12, 1, 9);
      const rightNo = pickNear(rightNoX, 10, 1, 200);
      const rightAns = pickNear(rightAnsX, 12, 1, 9);
      if (leftNo && leftAns) map.set(leftNo, leftAns);
      if (rightNo && rightAns) map.set(rightNo, rightAns);
    }
  }
  return map;
}

function inferChoiceCount(text, answerValue) {
  const t = toHalf(text);
  const m1 = t.match(/後記\s*([0-9]+)\s*から\s*([0-9]+)\s*まで/);
  if (m1) return Number(m1[2]);
  if (/そうでない場合には2を選びなさい/.test(t)) return 2;
  if (/正しいものには○、誤っているものには×/.test(t)) return 8;
  return Math.max(4, answerValue || 4);
}

function cleanPrompt(text) {
  return text
    .replace(/\[(?:No|NO)\.?\s*\d{1,3}\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseChoicesFromPrompt(prompt) {
  const t = toHalf(prompt).replace(/\s+/g, ' ');
  const re = /([1-9][0-9]?)\s*[\.．]\s*(.*?)(?=(?:\s*[1-9][0-9]?\s*[\.．]\s*)|$)/g;
  const parsed = [];
  for (const m of t.matchAll(re)) {
    const text = (m[2] || '').trim();
    if (!text) continue;
    parsed.push({ no: Number(m[1]), text });
  }
  if (parsed.length === 0) return [];

  // 1..N が連番で出ている場合のみ選択肢として採用
  parsed.sort((a, b) => a.no - b.no);
  for (let i = 0; i < parsed.length; i++) {
    if (parsed[i].no !== i + 1) return [];
  }
  return parsed.map((p) => p.text);
}

function parseQuestionBlocks(fullText) {
  const text = toHalf(fullText);
  const headerRe = /〔第[^〕]+問〕/g;
  const headers = [...text.matchAll(headerRe)].map((m) => ({ index: m.index }));
  const blocks = [];

  for (let i = 0; i < headers.length; i++) {
    const start = headers[i].index;
    const end = i + 1 < headers.length ? headers[i + 1].index : text.length;
    const body = text.slice(start, end).trim();
    if (body.length < 30) continue;
    const nos = new Set();
    const noRe = /\[(?:No|NO)\.?\s*([0-9]{1,3})\]/g;
    for (const m of body.matchAll(noRe)) nos.add(Number(m[1]));
    if (nos.size === 0) continue;
    blocks.push({ text: cleanPrompt(body), nos });
  }
  return blocks;
}

function parseCsvRows(csv) {
  const [header, ...lines] = csv.trim().split(/\r?\n/);
  const cols = header.split(',');
  return lines.map((line) => {
    const vals = line.split(',');
    const obj = {};
    cols.forEach((c, i) => (obj[c] = vals[i]));
    return obj;
  });
}

async function build() {
  const rows = parseCsvRows(fs.readFileSync(QA_CSV, 'utf-8'));
  const sets = [];

  for (const row of rows) {
    const qPath = `data/pdfs/${row.question_pdf_id}.pdf`;
    const aPath = `data/answer_pdfs/${row.answer_pdf_id}.pdf`;
    if (!fs.existsSync(qPath) || !fs.existsSync(aPath)) continue;

    const qPages = await loadPdfItems(qPath);
    const qText = qPages.map((p) => itemsToLines(p).join('\n')).join('\n\n');
    const qBlocks = parseQuestionBlocks(qText);

    const aPages = await loadPdfItems(aPath);
    const aMap = parseAnswerMapFromPages(aPages);

    const questions = [];
    for (const [no, answer] of [...aMap.entries()].sort((x, y) => x[0] - y[0])) {
      const qBlock = qBlocks.find((b) => b.nos.has(no));
      if (!qBlock) continue;
      const choices = parseChoicesFromPrompt(qBlock.text);
      const choiceCount = choices.length > 0 ? choices.length : inferChoiceCount(qBlock.text, answer);
      questions.push({
        no,
        prompt: qBlock.text,
        choices,
        choice_count: choiceCount,
        answer
      });
    }

    sets.push({
      year: row.year,
      subject: row.subject,
      question_pdf_url: row.question_pdf_url,
      answer_pdf_url: row.answer_pdf_url,
      questions
    });
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify({ generated_at: new Date().toISOString(), sets }, null, 2) + '\n');
  console.log(`generated ${OUT_JSON} sets=${sets.length}`);
}

await build();
