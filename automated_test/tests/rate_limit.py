"""
Rate limit test: send a small burst of requests to an endpoint to detect throttling.

Requires input.json with baseUrl. Default target is '/'
"""
import json
import subprocess
import shlex
from pathlib import Path
import time

ROOT = Path(__file__).resolve().parents[3]
INPUT = ROOT / 'input.json'
OUT = Path(__file__).resolve().parents[1] / 'report_rate_limit.json'

if not INPUT.exists():
    print('input.json missing. Create it at repo root with baseUrl and tokens. See automated_test/input.example.json')
    raise SystemExit(1)

with INPUT.open() as f:
    cfg = json.load(f)
base = cfg.get('baseUrl')

url = base.rstrip('/') + '/'
results = []
for i in range(30):
    cmd = ['curl','-s','-w','\\n%{http_code} %{time_total}\\n','--max-time','10', url]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    out = proc.stdout.strip()
    if '\n' in out:
        body, last = out.rsplit('\n',1)
    else:
        body, last = '', out
    status, ttotal = last.split() if last else ('', '0')
    results.append({'i': i+1, 'status': int(status), 'time': float(ttotal)})
    time.sleep(0.1)

OUT.write_text(json.dumps(results, indent=2))
print('Wrote', OUT)

