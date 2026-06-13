"""
Token tampering tests: flip claims in JWT without re-signing to test server verification.

This script will take a token from input.json, modify payload, and send request.
"""
import json
import base64
import subprocess
import shlex
from pathlib import Path
import time

ROOT = Path(__file__).resolve().parents[3]
INPUT = ROOT / 'input.json'
DISC = Path(__file__).resolve().parents[2] / 'discovered_endpoints.json'
OUT = Path(__file__).resolve().parents[1] / 'report_token_tamper.json'

if not INPUT.exists():
    print('input.json missing. Create it at repo root with baseUrl and tokens. See automated_test/input.example.json')
    raise SystemExit(1)

with INPUT.open() as f:
    cfg = json.load(f)
base = cfg.get('baseUrl')
user_token = cfg.get('user')
if not user_token:
    print('No user token in input.json')
    raise SystemExit(1)

def tamper_jwt(token):
    parts = token.split('.')
    if len(parts)!=3:
        return None
    header_b64, payload_b64, sig = parts
    # decode payload
    padding = '=' * ((4 - len(payload_b64) % 4) %4)
    payload = json.loads(base64.urlsafe_b64decode(payload_b64 + padding).decode())
    # flip isAdmin if present
    if 'isAdmin' in payload:
        payload['isAdmin'] = not payload['isAdmin']
    else:
        payload['isAdmin'] = True
    new_payload_b64 = base64.urlsafe_b64encode(json.dumps(payload,separators=(',',':')).encode()).decode().rstrip('=')
    return f"{header_b64}.{new_payload_b64}.{sig}"

with DISC.open() as f:
    discovered = json.load(f)['endpoints']

tampered = tamper_jwt(user_token)
if not tampered:
    print('Could not tamper token')
    raise SystemExit(1)

tests = []
for ep in discovered:
    if ep['requires']=='admin':
        url = base.rstrip('/') + ep['path']
        cmd = ['curl','-s','-X', ep['methods'][0], url, '-H', f"Authorization: Bearer {tampered}", '-w','\\n%{http_code} %{time_total}\\n','--max-time','10']
        print('Running tampered token test:', ' '.join(shlex.quote(c) for c in cmd))
        proc = subprocess.run(cmd, capture_output=True, text=True)
        out = proc.stdout.strip()
        if '\n' in out:
            body, last = out.rsplit('\n',1)
        else:
            body, last = '', out
        status, ttotal = last.split() if last else ('', '0')
        tests.append({'endpoint': ep['path'],'method': ep['methods'][0], 'role': 'tampered','status': int(status),'time': float(ttotal), 'body': body[:500]})
        time.sleep(0.2)

OUT.write_text(json.dumps(tests, indent=2))
print('Wrote', OUT)

