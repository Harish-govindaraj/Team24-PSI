import pandas as pd
import pytest

from app.utils.validators import (
    validate_dataset,
    load_and_validate,
    check_negative_values,
    check_genuine_zero_demand,
)
from app.utils.data_loader import DATE_COLUMN, CATEGORY_COLUMNS


def test_real_dataset_passes_validation():
    df, result = load_and_validate()
    assert result.is_valid is True
    assert result.fatal_errors == []


def test_negative_values_are_fatal():
    df = pd.DataFrame({
        DATE_COLUMN: pd.date_range("2024-01-01", periods=5),
        CATEGORY_COLUMNS[0]: [1, 2, -3, 4, 5],
    })
    for c in CATEGORY_COLUMNS[1:]:
        df[c] = 0
    errors = check_negative_values(df)
    assert len(errors) == 1
    assert CATEGORY_COLUMNS[0] in errors[0]


def test_zero_demand_is_reported_not_dropped():
    df = pd.DataFrame({
        DATE_COLUMN: pd.date_range("2024-01-01", periods=10),
        CATEGORY_COLUMNS[0]: [0, 0, 0, 0, 0, 0, 0, 0, 1, 2],
    })
    for c in CATEGORY_COLUMNS[1:]:
        df[c] = 1
    zero_pct = check_genuine_zero_demand(df)
    assert zero_pct[CATEGORY_COLUMNS[0]] == 80.0
    # the row count must be unchanged - zeros are never dropped
    assert len(df) == 10


def test_missing_required_columns_is_fatal():
    df = pd.DataFrame({DATE_COLUMN: pd.date_range("2024-01-01", periods=3)})
    result = validate_dataset(df)
    assert result.is_valid is False
    assert any("Missing category columns" in e for e in result.fatal_errors)