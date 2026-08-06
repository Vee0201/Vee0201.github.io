#!/usr/bin/env python3
"""
Pulls Research, ResearchFocus, Projects, SideProjects, Coursework, and Skills
from the Google Sheet (as published CSV) and writes them into a single static
data/content.json file in the repo.

This is deliberately NOT run automatically on a schedule. It only runs when:
  - You manually trigger the "Pull content from spreadsheet" GitHub Action
    (Actions tab -> select the workflow -> "Run workflow" button), or
  - You run this script locally: python3 scripts/pull_sheet_data.py

The live site reads data/content.json directly (a same-origin static file),
NOT the Google Sheet. So visitors never trigger a fetch to Google — only you
do, and only when you choose to.
"""
import csv
import io
import json
import sys
import urllib.request
from pathlib import Path

SHEET_ID = "18qeKeF1IQj3G9GKwxpjSoNg5a9C0PNUNtdYIhEOycC8"
SHEETS = ["Research", "ResearchFocus", "Projects", "SideProjects", "Coursework", "Skills"]
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "data" / "content.json"


def sheet_csv_url(sheet_name: str) -> str:
    from urllib.parse import quote
    return (
        f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq"
        f"?tqx=out:csv&sheet={quote(sheet_name)}"
    )


def fetch_sheet(sheet_name: str) -> list[dict]:
    url = sheet_csv_url(sheet_name)
    try:
        with urllib.request.urlopen(url, timeout=20) as resp:
            raw = resp.read().decode("utf-8")
    except Exception as e:
        print(f"  WARNING: failed to fetch '{sheet_name}': {e}", file=sys.stderr)
        return []

    reader = csv.reader(io.StringIO(raw))
    rows = list(reader)
    if not rows:
        return []

    headers = [h.strip() for h in rows[0]]
    records = []
    for row in rows[1:]:
        if not any(cell.strip() for cell in row):
            continue  # skip blank rows
        record = {headers[i]: (row[i].strip() if i < len(row) else "") for i in range(len(headers))}
        records.append(record)
    return records


def main():
    print(f"Pulling {len(SHEETS)} sheet tabs from Google Sheets…")
    data = {}
    for name in SHEETS:
        records = fetch_sheet(name)
        # camelCase key for JS-side consumption
        key = name[0].lower() + name[1:]
        data[key] = records
        print(f"  {name}: {len(records)} row(s)")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
