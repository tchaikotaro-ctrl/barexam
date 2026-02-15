#!/usr/bin/env python3
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

QUESTIONS_PATH = ROOT / "data" / "short_answer_questions_by_subject.json"
ANSWERS_PATH = ROOT / "data" / "short_answer_answers_by_subject.json"

OUT_JSON = ROOT / "data" / "short_answer_qa_by_subject.json"
OUT_CSV = ROOT / "data" / "short_answer_qa.csv"


def to_index(subjects_obj: dict, link_key: str, source_key: str) -> dict:
    idx = {}
    for subject, rows in subjects_obj.items():
        for row in rows:
            key = (row["year"], subject)
            idx[key] = {
                f"{source_key}_pdf_url": row[link_key],
                f"{source_key}_pdf_id": row["pdf_id"],
                f"{source_key}_source_page": row["source_page"],
            }
    return idx


def main():
    questions = json.loads(QUESTIONS_PATH.read_text(encoding="utf-8"))
    answers = json.loads(ANSWERS_PATH.read_text(encoding="utf-8"))

    q_idx = to_index(questions["subjects"], "pdf_url", "question")
    a_idx = to_index(answers["subjects"], "answer_pdf_url", "answer")

    keys = sorted(set(q_idx.keys()) | set(a_idx.keys()), key=lambda x: (x[1], x[0]))

    merged_rows = []
    for year, subject in keys:
        row = {"year": year, "subject": subject}
        row.update(q_idx.get((year, subject), {}))
        row.update(a_idx.get((year, subject), {}))
        merged_rows.append(row)

    by_subject = {}
    for row in merged_rows:
        by_subject.setdefault(row["subject"], []).append(row)
    for subject in by_subject:
        by_subject[subject] = sorted(by_subject[subject], key=lambda r: r["year"], reverse=True)

    OUT_JSON.write_text(
        json.dumps(
            {
                "source_pages": {
                    "questions": questions["source_pages"],
                    "answers": answers["source_pages"],
                },
                "subjects": by_subject,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    fieldnames = [
        "year",
        "subject",
        "question_pdf_url",
        "question_pdf_id",
        "question_source_page",
        "answer_pdf_url",
        "answer_pdf_id",
        "answer_source_page",
    ]
    with OUT_CSV.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in merged_rows:
            writer.writerow(row)


if __name__ == "__main__":
    main()
