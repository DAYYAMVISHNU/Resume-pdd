"""
AuthN bypass tests: attempts to call protected endpoints without auth or with malformed tokens.

This script expects `automated_test/discovered_endpoints.json` and `input.json` in the repo root.
If `input.json` is missing it will print instructions and exit.
"""
import json
import subprocess
import shlex
from pathlib import Path
import time

ROOT = Path(__file__).resolve().parents[3]
INPUT = ROOT / 'input.json'
DISC = Path(__file__).resolve().parents[2] / 'discovered_endpoints.json'
OUT = Path(__file__).resolve().parents[1] / 'report_authn_bypass.json'

if not INPUT.exists():
    print('input.json missing. Create it at repo root with baseUrl and tokens. See automated_test/input.example.json')
    raise SystemExit(1)

with INPUT.open() as f:
    cfg = json.load(f)
base = cfg.get('baseUrl')
with DISC.open() as f:
    discovered = json.load(f)['endpoints']

tests = []
for ep in discovered:
    if ep['requires'] in ('token','admin'):
        url = base.rstrip('/') + ep['path']
        cmd = ['curl','-s','-X', ep['methods'][0], url, '-w','\\n%{http_code} %{time_total}\\n','--max-time','10']
        print('Running (no auth):', ' '.join(shlex.quote(c) for c in cmd))
        proc = subprocess.run(cmd, capture_output=True, text=True)
        out = proc.stdout.strip()
        if '\n' in out:
            body, last = out.rsplit('\n',1)
        else:
            body, last = '', out
        status, ttotal = last.split() if last else ('', '0')
        tests.append({'endpoint': ep['path'],'method': ep['methods'][0], 'role':'anonymous','status': int(status),'time': float(ttotal), 'body': body[:500]})
        time.sleep(0.2)

OUT.write_text(json.dumps(tests, indent=2))
print('Wrote', OUT)

