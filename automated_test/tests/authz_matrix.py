"""
RBAC matrix tests: call role-restricted endpoints with different role tokens.

Requires `input.json` with tokens for roles (e.g., user/admin).
"""
import json
import subprocess
import shlex
from pathlib import Path
import time

ROOT = Path(__file__).resolve().parents[3]
INPUT = ROOT / 'input.json'
DISC = Path(__file__).resolve().parents[2] / 'discovered_endpoints.json'
OUT = Path(__file__).resolve().parents[1] / 'report_authz_matrix.json'

if not INPUT.exists():
    print('input.json missing. Create it at repo root with baseUrl and tokens. See automated_test/input.example.json')
    raise SystemExit(1)

with INPUT.open() as f:
    cfg = json.load(f)
base = cfg.get('baseUrl')
tokens = {k:v for k,v in cfg.items() if k!='baseUrl'}
with DISC.open() as f:
    discovered = json.load(f)['endpoints']

tests = []
for ep in discovered:
    if ep['requires']=='admin' or ep['requires']=='token':
        for role, token in tokens.items():
            headers = {'Authorization': f'Bearer {token}'}
            url = base.rstrip('/') + ep['path']
            cmd = ['curl','-s','-X', ep['methods'][0], url, '-H', f"Authorization: Bearer {token}", '-w','\\n%{http_code} %{time_total}\\n','--max-time','10']
            print('Running:', ' '.join(shlex.quote(c) for c in cmd))
            proc = subprocess.run(cmd, capture_output=True, text=True)
            out = proc.stdout.strip()
            if '\n' in out:
                body, last = out.rsplit('\n',1)
            else:
                body, last = '', out
            status, ttotal = last.split() if last else ('', '0')
            tests.append({'endpoint': ep['path'],'method': ep['methods'][0], 'role': role,'status': int(status),'time': float(ttotal), 'body': body[:500]})
            time.sleep(0.2)

OUT.write_text(json.dumps(tests, indent=2))
print('Wrote', OUT)

