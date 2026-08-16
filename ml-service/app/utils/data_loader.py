"""
Data loading utilities for the PSI ML service.

Loads the real historical pharmacy sales dataset (salesdaily.csv) and
returns a clean, chronologically sorted pandas DataFrame. This module
does NOT validate business rules (missing values, duplicates, negative
values) - that lives in validators.py. This module only handles the
mechanics of reading the file and parsing dates/columns correctly.
"""

from __future__ import annotations

import logging
from pathlib import Path

import pandas as pd

logger = logging.getLogger(__name__)

# Project-relative path: this file lives at app/utils/data_loader.py,
# so we go up two levels to reach ml-service/, then into data/raw/.
# This works identically on macOS and Windows because pathlib handles
# the separator differences - never hardcode "/" or "\" yourself.
PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATA_PATH = PROJECT_ROOT / "data" / "raw" / "salesdaily.csv"

# Edit this list if your actual salesdaily.csv header differs from the
# standard Kaggle pharmacy-sales schema. Run:
#   python3 -c "import pandas as pd; print(pd.read_csv('data/raw/salesdaily.csv', nrows=0).columns.tolist())"
# and compare against what's below before changing anything.
DATE_COLUMN = "datum"
CATEGORY_COLUMNS = [
    "M01AB",
    "M01AE",
    "N02BA",
    "N02BE",
    "N05B",
    "N05C",
    "R03",
    "R06",
]


class DataLoadError(Exception):
    """Raised when the raw CSV cannot be read or parsed at all."""


def load_raw_sales_data(path: Path | str | None = None) -> pd.DataFrame:
    """
    Load salesdaily.csv from disk and return a DataFrame with a proper
    datetime index, sorted chronologically. Raises DataLoadError with a
    clear message if the file is missing or unreadable.
    """
    csv_path = Path(path) if path is not None else DEFAULT_DATA_PATH

    if not csv_path.exists():
        raise DataLoadError(
            f"Dataset not found at {csv_path}. "
            f"Expected it at data/raw/salesdaily.csv relative to the "
            f"ml-service project root. Did you complete Part 7 of the "
            f"Step 1 cookbook?"
        )

    try:
        df = pd.read_csv(csv_path)
    except Exception as exc:  # noqa: BLE001 - we want to wrap any read error
        raise DataLoadError(f"Failed to read {csv_path}: {exc}") from exc

    if DATE_COLUMN not in df.columns:
        raise DataLoadError(
            f"Expected date column '{DATE_COLUMN}' not found in {csv_path}. "
            f"Actual columns: {df.columns.tolist()}. "
            f"Update DATE_COLUMN in data_loader.py to match your file."
        )

    try:
        df[DATE_COLUMN] = pd.to_datetime(df[DATE_COLUMN], format="mixed", dayfirst=False)
    except Exception as exc:  # noqa: BLE001
        raise DataLoadError(
            f"Failed to parse dates in column '{DATE_COLUMN}': {exc}"
        ) from exc

    df = df.sort_values(DATE_COLUMN).reset_index(drop=True)

    logger.info(
        "Loaded %d rows from %s, date range %s to %s",
        len(df),
        csv_path,
        df[DATE_COLUMN].min(),
        df[DATE_COLUMN].max(),
    )

    return df


def get_category_series(df: pd.DataFrame, category: str) -> pd.Series:
    """
    Return the daily sales series for a single drug category, indexed
    by date. Raises KeyError with a clear message if the category
    doesn't exist in the dataset.
    """
    if category not in df.columns:
        raise KeyError(
            f"Category '{category}' not found. Available categories: "
            f"{[c for c in CATEGORY_COLUMNS if c in df.columns]}"
        )
    series = df.set_index(DATE_COLUMN)[category]
    return series
    