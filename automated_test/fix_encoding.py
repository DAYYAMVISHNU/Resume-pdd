#!/usr/bin/env python3
"""Remove all non-cp1252 characters from DAST scripts."""
MAPPING = {
    0x2192: "->",   # right arrow
    0x2190: "<-",   # left arrow
    0x2714: "[OK]", # heavy check mark
    0x2718: "[X]",  # heavy ballot x
    0x00B7: ".",    # middle dot
    0x2026: "...",  # ellipsis
    0x201C: '"',    # left double quote
    0x201D: '"',    # right double quote
    0x2018: "'",    # left single quote
    0x2019: "'",    # right single quote
    0x2014: "--",   # em dash
    0x2013: "-",    # en dash
    0x00D7: "x",    # multiplication sign
    0x00F7: "/",    # division sign
}

FILES = [
    "automated_test/dast_runner.py",
    "automated_test/quick_dast.py",
    "automated_test/build_report.py",
]

for fpath in FILES:
    try:
        src = open(fpath, encoding="utf-8").read()
        out = []
        changed = 0
        for ch in src:
            cp = ord(ch)
            if cp in MAPPING:
                out.append(MAPPING[cp])
                changed += 1
            else:
                try:
                    ch.encode("cp1252")
                    out.append(ch)
                except UnicodeEncodeError:
                    out.append("?")
                    changed += 1
        fixed = "".join(out)
        open(fpath, "w", encoding="utf-8").write(fixed)
        try:
            fixed.encode("cp1252")
            print(f"OK  {fpath}  ({changed} chars replaced)")
        except UnicodeEncodeError as e:
            print(f"STILL BAD  {fpath}: {e}")
    except FileNotFoundError:
        print(f"SKIP  {fpath}  (not found)")
