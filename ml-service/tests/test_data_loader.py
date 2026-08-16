import pandas as pd
import pytest

from app.utils.data_loader import (
    DataLoadError,
    DATE_COLUMN,
    load_raw_sales_data,
    get_category_series,
)


def test_load_raw_sales_data_returns_sorted_dataframe():
    df = load_raw_sales_data()
    assert isinstance(df, pd.DataFrame)
    assert len(df) > 0
    assert DATE_COLUMN in df.columns
    # Chronological ordering is a hard requirement for time-series safety.
    assert df[DATE_COLUMN].is_monotonic_increasing


def test_load_raw_sales_data_missing_file_raises():
    with pytest.raises(DataLoadError):
        load_raw_sales_data(path="data/raw/this_file_does_not_exist.csv")


def test_get_category_series_returns_indexed_series():
    df = load_raw_sales_data()
    from app.utils.data_loader import CATEGORY_COLUMNS

    existing = [c for c in CATEGORY_COLUMNS if c in df.columns]
    assert existing, "None of the expected category columns are in the dataset - check CATEGORY_COLUMNS in data_loader.py"

    series = get_category_series(df, existing[0])
    assert series.index.name == DATE_COLUMN
    assert len(series) == len(df)


def test_get_category_series_unknown_category_raises():
    df = load_raw_sales_data()
    with pytest.raises(KeyError):
        get_category_series(df, "NOT_A_REAL_CATEGORY")