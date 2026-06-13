"""
Test runner for DAST automated tests.

This runner reads `input.json` at the workspace root to obtain `baseUrl` and role tokens.
It expects the discovery output `discovered_endpoints.json` to exist.

At this stage the runner only implements the scaffolding and will call `curl` using subprocess
when invoked. It writes `report.json` into this directory.

Note: This script invokes external network calls (curl). If your environment does
not allow outgoing HTTP requests or curl is not installed, run the script locally
and provide the generated `report.json` back for me to continue analysis.
"""
import json
import subprocess
import shlex
from pathlib import Path
import time


ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / 'input.json'
DISC = Path(__file__).parent / 'discovered_endpoints.json'
REPORT = Path(__file__).parent / 'report.json'

if not INPUT.exists():
    print(f"Missing input.json at {INPUT}. Please create it with the shape: { {'baseUrl':'...', 'role':'<token>'} })")
    raise SystemExit(1)

with INPUT.open() as f:
    cfg = json.load(f)

base = cfg.get('baseUrl')
if not base:
    print('input.json must contain baseUrl')
    raise SystemExit(1)

if not DISC.exists():
    print('Run discover_endpoints.py first to populate discovered_endpoints.json')
    raise SystemExit(1)

with DISC.open() as f:
    discovered = json.load(f)['endpoints']

report = []

def run_curl(method, url, headers=None, data=None, files=None, max_time=10):
    cmd = ['curl', '-s', '-X', method, f"{url}", '-w', '\n%{http_code} %{time_total}\n', '--max-time', str(max_time)]
    if headers:
        for k, v in headers.items():
            cmd += ['-H', f'{k}: {v}']
    if data:
        cmd += ['-H', 'Content-Type: application/json', '-d', json.dumps(data)]
    if files:
        for field, path in files.items():
            cmd += ['-F', f"{field}=@{path}"]

    print('Running:', ' '.join(shlex.quote(c) for c in cmd))
    proc = subprocess.run(cmd, capture_output=True, text=True)
    out = proc.stdout.strip()
    # Last line contains HTTP code and time
    if '\n' in out:
        body, last = out.rsplit('\n', 1)
    else:
        body, last = '', out
    status, ttotal = last.split() if last else ('', '0')
    return int(status) if status else 0, float(ttotal), body

# Example: run a GET to the home endpoint
for ep in discovered:
    if 'GET' in ep['methods']:
        url = base.rstrip('/') + ep['path']
        # Use no auth by default
        status, ttotal, body = run_curl('GET', url)
        report.append({
            'endpoint': ep['path'],
            'method': 'GET',
            'role': 'anonymous',
            'status': status,
            'expected_status': 200 if ep['requires']=='none' else 401,
            'finding': ep['requires']!='none' and status==200,
            'severity': 'high' if ep['requires']!='none' and status==200 else 'info',
            'response_time_ms': int(ttotal*1000),
            'test_category': 'discovery_get',
            'note': '',
            'timestamp': int(time.time())
        })

REPORT.write_text(json.dumps(report, indent=2))
print(f'Wrote report to {REPORT} with {len(report)} entries')

