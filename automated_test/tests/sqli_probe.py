"""
Injection detection probes (non-destructive): send SQLi-like payloads in query/body to detect errors or timing anomalies.

Requires input.json with baseUrl and tokens.
"""
import json
import subprocess
import shlex
from pathlib import Path
import time

ROOT = Path(__file__).resolve().parents[3]
INPUT = ROOT / 'input.json'
DISC = Path(__file__).resolve().parents[2] / 'discovered_endpoints.json'
OUT = Path(__file__).resolve().parents[1] / 'report_sqli_probe.json'

if not INPUT.exists():
    print('input.json missing. Create it at repo root with baseUrl and tokens. See automated_test/input.example.json')
    raise SystemExit(1)

with INPUT.open() as f:
    cfg = json.load(f)
base = cfg.get('baseUrl')
token = cfg.get('user')
with DISC.open() as f:
    discovered = json.load(f)['endpoints']

payloads = ["' OR '1'='1", "' UNION SELECT NULL--", "\" OR \"1\"=\"1\"", "; DROP TABLE users; --"]

tests = []
for ep in discovered:
    # only probe GET/POST public or token endpoints safely
    if 'GET' in ep['methods'] or 'POST' in ep['methods']:
        url = base.rstrip('/') + ep['path']
        for p in payloads:
            data_flag = ['-d', f"q={p}"] if 'POST' in ep['methods'] else []
            cmd = ['curl','-s','-X', ep['methods'][0], url]
            if token:
                cmd += ['-H', f"Authorization: Bearer {token}"]
            if data_flag:
                cmd += ['-H', 'Content-Type: application/x-www-form-urlencoded'] + data_flag
            cmd += ['-w','\\n%{http_code} %{time_total}\\n','--max-time','10']
            print('Running probe:', ' '.join(shlex.quote(c) for c in cmd))
            proc = subprocess.run(cmd, capture_output=True, text=True)
            out = proc.stdout.strip()
            if '\n' in out:
                body, last = out.rsplit('\n',1)
            else:
                body, last = '', out
            status, ttotal = last.split() if last else ('', '0')
            tests.append({'endpoint': ep['path'],'method': ep['methods'][0], 'payload': p,'status': int(status),'time': float(ttotal), 'body': body[:500]})
            time.sleep(0.2)

OUT.write_text(json.dumps(tests, indent=2))
print('Wrote', OUT)

