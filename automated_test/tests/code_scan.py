"""
Simple code scanner to find likely hardcoded secrets in the repository.

Writes findings to automated_test/report_code_scan.json
"""
import re
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parents[1] / 'report_code_scan.json'

patterns = [
    re.compile(r"JWT_SECRET\s*=\s*['\"]([^'\"]+)['\"]"),
    re.compile(r"SECRET\w*\s*=\s*['\"]([^'\"]+)['\"]", re.I),
    re.compile(r"API[_-]?KEY\s*=\s*['\"]([^'\"]+)['\"]", re.I),
    re.compile(r"password\s*=\s*['\"]([^'\"]+)['\"]", re.I),
]

files_to_scan = list((ROOT / 'backend').rglob('*.py'))

findings = []
for f in files_to_scan:
    text = f.read_text(encoding='utf-8', errors='ignore')
    for p in patterns:
        for m in p.finditer(text):
            secret = m.group(1)
            # don't include full secret in output; only reveal partial and location
            findings.append({
                'file': str(f.relative_to(ROOT)),
                'match': p.pattern,
                'snippet': secret[:4] + '...' if len(secret)>4 else '****',
                'line_context': '\n'.join(text.splitlines()[max(0, text[:m.start()].count('\n')-1):max(0, text[:m.start()].count('\n')+2)])
            })

OUT.write_text(json.dumps({'count': len(findings), 'findings': findings}, indent=2))
print(f"Code scan complete. Found {len(findings)} potential secrets. Report: {OUT}")

