#!/usr/bin/env python3
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SRC = Path('/mnt/c/Users/kotar/OneDrive/デスクトップ/prebarexam')
DEFAULT_OUT = ROOT / 'data' / 'short_answer_explanations.json'


def main() -> None:
    parser = argparse.ArgumentParser(description='Import explanations from prebarexam JSON')
    parser.add_argument('--src', type=Path, default=DEFAULT_SRC)
    parser.add_argument('--out', type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    raw = json.loads(args.src.read_text(encoding='utf-8'))
    items = raw.get('items', [])

    explanation_map = {}
    for item in items:
        year = item.get('year', '').strip()
        subject = item.get('booklet', '').strip()
        no = int(item.get('question_no', 0) or 0)
        if not year or not subject or no <= 0:
            continue

        options = {}
        for opt in item.get('options', []):
            n = int(opt.get('option', 0) or 0)
            if n <= 0:
                continue
            options[str(n)] = {
                'is_correct': bool(opt.get('is_correct', False)),
                'basis': str(opt.get('basis', '')).strip(),
            }

        key = f'{year}__{subject}__{no}'
        explanation_map[key] = {
            'year': year,
            'subject': subject,
            'no': no,
            'answer_style': item.get('answer_style', ''),
            'correct_options': [int(x) for x in item.get('correct_options', []) if str(x).isdigit()],
            'options': options,
        }

    out_obj = {
        'meta': {
            'source': str(args.src),
            'imported_items': len(items),
            'mapped_items': len(explanation_map),
            'upstream_meta': raw.get('meta', {}),
        },
        'by_question_key': explanation_map,
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(out_obj, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'generated: {args.out} mapped_items={len(explanation_map)}')


if __name__ == '__main__':
    main()
