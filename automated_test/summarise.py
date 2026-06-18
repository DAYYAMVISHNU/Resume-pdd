import json

data = json.load(open("automated_test/report.json"))
findings = [r for r in data if r["finding"]]
by_sev = {}
for r in findings:
    by_sev.setdefault(r["severity"], []).append(r)
by_cat = {}
for r in data:
    by_cat.setdefault(r["test_category"], {"total": 0, "findings": 0})
    by_cat[r["test_category"]]["total"] += 1
    if r["finding"]:
        by_cat[r["test_category"]]["findings"] += 1

print("=" * 60)
print("  DAST FINAL RESULTS")
print("=" * 60)
print(f"  Total test records : {len(data)}")
print(f"  Total findings     : {len(findings)}")
print("\n  By severity:")
for sev in ["critical", "high", "medium", "low", "info"]:
    c = len(by_sev.get(sev, []))
    if c:
        print(f"    {sev.upper():12s}: {c}")
print("\n  By category:")
for cat, d in by_cat.items():
    sym = "[X]" if d["findings"] else "[ ]"
    print(f"    {sym} {cat:30s}: {d['findings']}/{d['total']}")
print("\n  ALL FINDINGS:")
for r in findings:
    print(f"\n  [{r['severity'].upper()}] [{r['test_category']}]")
    print(f"    {r['method']} {r['endpoint']}  (role={r['role']}, status={r['status']})")
    print(f"    {r['note'][:100]}")
print("=" * 60)
