"""
Generates the synthetic operational dataset for every real category and
saves it to data/synthetic/operational_data.json.

Run manually whenever you want to regenerate it:

    python3 scripts/generate_synthetic_data.py

Kept separate from scripts/train.py on purpose - this touches only
synthetic demo data, never real data or trained models, and keeping
the two scripts separate makes that boundary obvious.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.utils.data_loader import load_raw_sales_data, CATEGORY_COLUMNS
from app.synthetic.generator import generate_all_operational_records, operational_record_to_dict

PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = PROJECT_ROOT / "data" / "synthetic" / "operational_data.json"


def main():
    df = load_raw_sales_data()
    existing_categories = [c for c in CATEGORY_COLUMNS if c in df.columns]

    records = generate_all_operational_records(existing_categories)
    output = {cat: operational_record_to_dict(rec) for cat, rec in records.items()}

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Wrote {len(output)} SYNTHETIC operational records to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()