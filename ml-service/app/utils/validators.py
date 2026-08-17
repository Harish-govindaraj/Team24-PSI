"""
Validation rules for the raw PSI sales dataset.

Every function here returns a structured ValidationResult instead of
raising, so callers (tests, future API endpoints) can decide whether a
given issue is fatal or just worth logging. Only load_and_validate()
raises, and only if a FATAL check fails.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

import pandas as pd

from app.utils.data_loader import (
    CATEGORY_COLUMNS,
    DATE_COLUMN,
    DataLoadError,
    load_raw_sales_data,
)

logger = logging.getLogger(__name__)


@dataclass
class ValidationResult:
    is_valid: bool
    fatal_errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


class DatasetValidationError(Exception):
    """Raised by load_and_validate() when a FATAL check fails."""


def check_required_columns(df: pd.DataFrame) -> list[str]:
    """Returns a list of fatal error messages (empty if all good)."""
    errors = []
    if DATE_COLUMN not in df.columns:
        errors.append(f"Missing required date column: '{DATE_COLUMN}'")
    missing_categories = [c for c in CATEGORY_COLUMNS if c not in df.columns]
    if missing_categories:
        errors.append(f"Missing category columns: {missing_categories}")
    return errors


def check_missing_values(df: pd.DataFrame) -> list[str]:
    """Returns warnings (not fatal - a handful of NaNs is common in
    real-world sales data and gets handled downstream, not silently
    dropped)."""
    warnings = []
    for col in [DATE_COLUMN] + [c for c in CATEGORY_COLUMNS if c in df.columns]:
        n_missing = df[col].isna().sum()
        if n_missing > 0:
            pct = 100 * n_missing / len(df)
            warnings.append(f"Column '{col}' has {n_missing} missing values ({pct:.2f}%)")
    return warnings


def check_duplicates(df: pd.DataFrame) -> list[str]:
    """Duplicate dates are a warning, not fatal - could be a genuine
    data quality issue that Step 2's feature engineering needs to know
    about, but doesn't block loading."""
    warnings = []
    dup_count = df.duplicated(subset=[DATE_COLUMN]).sum()
    if dup_count > 0:
        warnings.append(f"{dup_count} duplicate '{DATE_COLUMN}' rows found")
    return warnings


def check_negative_values(df: pd.DataFrame) -> list[str]:
    """Negative sales are FATAL - they are physically impossible and
    indicate a data corruption issue that must be fixed before any
    modeling happens."""
    errors = []
    for col in CATEGORY_COLUMNS:
        if col not in df.columns:
            continue
        n_negative = (df[col] < 0).sum()
        if n_negative > 0:
            errors.append(f"Column '{col}' has {n_negative} negative values")
    return errors


def check_genuine_zero_demand(df: pd.DataFrame) -> dict[str, float]:
    """
    Zero is a valid, meaningful value here (a drug category that simply
    had no sales that day) - this is NOT missing data and must never be
    dropped or imputed away. This function just reports the percentage
    of zero-demand days per category so Part 10's stats module and
    Step 2's intermittent-demand handling (N05C in particular) know
    what they're dealing with.
    """
    zero_pct = {}
    for col in CATEGORY_COLUMNS:
        if col not in df.columns:
            continue
        zero_pct[col] = round(100 * (df[col] == 0).mean(), 2)
    return zero_pct


def validate_dataset(df: pd.DataFrame) -> ValidationResult:
    fatal_errors: list[str] = []
    warnings: list[str] = []

    fatal_errors += check_required_columns(df)

    # If columns are missing, every other check would crash - stop here.
    if fatal_errors:
        return ValidationResult(is_valid=False, fatal_errors=fatal_errors, warnings=warnings)

    warnings += check_missing_values(df)
    warnings += check_duplicates(df)
    fatal_errors += check_negative_values(df)

    zero_pct = check_genuine_zero_demand(df)
    for col, pct in zero_pct.items():
        if pct > 50:
            warnings.append(
                f"Column '{col}' is {pct}% zero-demand - treat as intermittent "
                f"demand in Step 2 (do not use plain averaging models on it)"
            )

    is_valid = len(fatal_errors) == 0
    return ValidationResult(is_valid=is_valid, fatal_errors=fatal_errors, warnings=warnings)


def load_and_validate(path=None) -> tuple[pd.DataFrame, ValidationResult]:
    """
    Convenience entry point: loads the CSV and validates it in one call.
    Raises DatasetValidationError if any FATAL check fails. Warnings are
    logged but do not block - the caller gets the DataFrame plus the
    full ValidationResult either way.
    """
    try:
        df = load_raw_sales_data(path)
    except DataLoadError as exc:
        raise DatasetValidationError(str(exc)) from exc

    result = validate_dataset(df)

    for w in result.warnings:
        logger.warning(w)

    if not result.is_valid:
        raise DatasetValidationError(
            "Dataset failed validation with fatal errors: " + "; ".join(result.fatal_errors)
        )

    return df, result