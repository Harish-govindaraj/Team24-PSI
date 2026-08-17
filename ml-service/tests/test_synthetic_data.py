from app.synthetic.generator import generate_operational_record, generate_all_operational_records


def test_operational_record_is_deterministic_per_category():
    rec1 = generate_operational_record("R03")
    rec2 = generate_operational_record("R03")
    assert rec1 == rec2


def test_different_categories_can_differ():
    rec_a = generate_operational_record("R03")
    rec_b = generate_operational_record("N05C")
    assert rec_a.category != rec_b.category


def test_record_marked_synthetic():
    assert generate_operational_record("R03").is_synthetic is True


def test_generate_all_returns_one_per_category():
    records = generate_all_operational_records(["R03", "N05C", "M01AB"])
    assert set(records.keys()) == {"R03", "N05C", "M01AB"}