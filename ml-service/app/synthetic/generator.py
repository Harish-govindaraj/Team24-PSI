"""
Synthetic operational data generator for the PSI decision-intelligence
layer.

Everything here is SYNTHETIC / DEMO data - NOT derived from real
inventory systems, real suppliers, or real patient records. The real
dataset (salesdaily.csv) has no inventory, expiry, supplier, lead-time,
patient-impact, region, price, or promotion columns at all - this
module invents plausible values so the decision layer has something to
reason over. Every API response built from this data carries the
disclaimer below - never present numbers from this module as measured
historical fact the way Step 1/2's real-data stats are.
"""

from __future__ import annotations

import random
from dataclasses import dataclass, asdict

SYNTHETIC_DATA_NOTICE = (
    "This record is SYNTHETIC/DEMO operational data generated for "
    "hackathon purposes. It is NOT derived from real inventory, "
    "supplier, or patient records, and must never be treated as "
    "measured historical fact."
)

REGIONS = ["North", "South", "East", "West", "Central"]


@dataclass
class OperationalRecord:
    category: str
    inventory_units: int
    reorder_point_units: int
    supplier_lead_time_days: int
    expiry_days_remaining: int
    patient_impact_score: int  # 1 (low) - 10 (high) - SYNTHETIC severity proxy, not clinical
    substitute_available: bool
    region: str
    unit_price_inr: float
    promotion_active: bool
    is_synthetic: bool = True


def _seed_for_category(category: str, base_seed: int = 42) -> int:
    # Deterministic per-category seed so regenerating the dataset
    # always reproduces the same synthetic values for the same
    # category - reproducibility without persisting RNG state.
    return base_seed + sum(ord(c) for c in category)


def generate_operational_record(category: str, base_seed: int = 42) -> OperationalRecord:
    rng = random.Random(_seed_for_category(category, base_seed))
    return OperationalRecord(
        category=category,
        inventory_units=rng.randint(50, 2000),
        reorder_point_units=rng.randint(50, 300),
        supplier_lead_time_days=rng.randint(3, 21),
        expiry_days_remaining=rng.randint(15, 540),
        patient_impact_score=rng.randint(1, 10),
        substitute_available=rng.random() > 0.5,
        region=rng.choice(REGIONS),
        unit_price_inr=round(rng.uniform(5.0, 500.0), 2),
        promotion_active=rng.random() > 0.8,
    )


def generate_all_operational_records(categories: list[str], base_seed: int = 42) -> dict[str, OperationalRecord]:
    return {c: generate_operational_record(c, base_seed) for c in categories}


def operational_record_to_dict(record: OperationalRecord) -> dict:
    d = asdict(record)
    d["disclaimer"] = SYNTHETIC_DATA_NOTICE
    return d