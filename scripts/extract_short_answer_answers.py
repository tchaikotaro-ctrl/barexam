#!/usr/bin/env python3
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "data" / "raw"
BASE_URL = "https://www.moj.go.jp"

YEAR_MAP = {
    "r7_answers.html": "令和7年",
    "r6_answers.html": "令和6年",
    "r5_answers.html": "令和5年",
}
SOURCE_URLS = {
    "r7_answers.html": "https://www.moj.go.jp/jinji/shihoushiken/jinji07_00289.html",
    "r6_answers.html": "https://www.moj.go.jp/jinji/shihoushiken/jinji07_00258.html",
    "r5_answers.html": "https://www.moj.go.jp/jinji/shihoushiken/jinji07_00164.html",
}


def extract_records(html_text: str, year: str, source_page: str):
    m = re.search(
        r"<h2 class=\"cnt_ttl02\"><span>正解及び配点</span></h2>(.*?)<h2 class=\"cnt_ttl02\"><span>司法試験予備試験用法文登載法令</span></h2>",
        html_text,
        flags=re.S,
    )
    if not m:
        raise RuntimeError(f"正解及び配点セクションを抽出できませんでした: {source_page}")

    section = m.group(1)
    records = []
    for href, subject, _pdf_size in re.findall(
        r"<li><a href=\"([^\"]+)\" class=\"blank\">([^<]+)</a>\[PDF：([0-9]+KB)\]</li>",
        section,
    ):
        if subject.strip() == "登載法令":
            continue
        full_url = BASE_URL + href
        pdf_id_match = re.search(r"/(\d+)\.pdf$", href)
        records.append(
            {
                "year": year,
                "subject": subject.strip(),
                "answer_pdf_url": full_url,
                "pdf_id": pdf_id_match.group(1) if pdf_id_match else "",
                "source_page": source_page,
            }
        )
    return records


def main():
    all_records = []
    for filename, year in YEAR_MAP.items():
        html_path = RAW_DIR / filename
        if not html_path.exists():
            raise FileNotFoundError(f"入力HTMLが見つかりません: {html_path}")
        html_text = html_path.read_text(encoding="utf-8")
        source_page = SOURCE_URLS[filename]
        all_records.extend(extract_records(html_text, year, source_page))

    by_subject = {}
    for record in all_records:
        by_subject.setdefault(record["subject"], []).append(record)

    for subject in by_subject:
        by_subject[subject] = sorted(by_subject[subject], key=lambda x: x["year"], reverse=True)

    out_json = ROOT / "data" / "short_answer_answers_by_subject.json"
    out_json.write_text(
        json.dumps(
            {
                "source_pages": list(SOURCE_URLS.values()),
                "subjects": by_subject,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    out_csv = ROOT / "data" / "short_answer_answers.csv"
    with out_csv.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["year", "subject", "answer_pdf_url", "pdf_id", "source_page"],
        )
        writer.writeheader()
        for record in sorted(all_records, key=lambda x: (x["subject"], x["year"])):
            writer.writerow(record)


if __name__ == "__main__":
    main()
