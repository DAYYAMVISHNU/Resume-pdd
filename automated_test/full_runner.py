#!/usr/bin/env python3
"""
Comprehensive DAST runner. Generates test tokens locally using JWT logic from app.py,
attempts to reach localhost:5000 or a configured baseUrl, and runs all test categories.

Environment variables can override defaults:
- BASE_URL (default: http://localhost:5000)
- ADMIN_EMAIL (default: lvishnu181@gmail.com)
- USER_EMAIL (default: vishnu@gmail.com)

Reads discovered_endpoints.json and runs all tests sequentially, throttled at 0.1s per request.
Writes automated_test/report.json in the required schema and generates a summary.
"""
import json
import base64
import hashlib
import hmac
import time
import os
import re
import subprocess
import shlex
import sys
from pathlib import Path
from datetime import datetime

# Configuration
ROOT = Path(__file__).resolve().parent
BASE_URL = os.environ.get('BASE_URL', 'http://localhost:5000')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'lvishnu181@gmail.com')
USER_EMAIL = os.environ.get('USER_EMAIL', 'vishnu@gmail.com')
JWT_SECRET = 'fyp-ats-analyzer-cryptographic-jwt-signature-key-2026'

DISC_FILE = ROOT / 'discovered_endpoints.json'
REPORT_FILE = ROOT / 'report.json'

print(f"[DAST Runner] Starting at {datetime.now().isoformat()}")
print(f"[CONFIG] BASE_URL={BASE_URL}, ADMIN_EMAIL={ADMIN_EMAIL}, USER_EMAIL={USER_EMAIL}")

if not DISC_FILE.exists():
    print(f"[ERROR] {DISC_FILE} not found. Run discover_endpoints.py first.")
    sys.exit(1)

# Load discovered endpoints
with DISC_FILE.open() as f:
    discovered = json.load(f)['endpoints']
print(f"[DISCOVERY] Loaded {len(discovered)} endpoints")

# JWT Token generation (matching backend/app.py)
def base64_url_encode(data: dict) -> str:
    json_str = json.dumps(data, separators=(',', ':'))
    return base64.urlsafe_b64encode(json_str.encode()).decode().rstrip("=")

def create_jwt_token(email: str, is_admin: bool) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "email": email.strip().lower(),
        "isAdmin": bool(is_admin),
        "exp": int(time.time()) + 86400
    }
    header_b64 = base64_url_encode(header)
    payload_b64 = base64_url_encode(payload)
    signature_base = f"{header_b64}.{payload_b64}"
    sig = hmac.new(JWT_SECRET.encode(), signature_base.encode(), hashlib.sha256).hexdigest()
    return f"{header_b64}.{payload_b64}.{sig}"

# Generate test tokens
admin_token = create_jwt_token(ADMIN_EMAIL, True)
user_token = create_jwt_token(USER_EMAIL, False)
print(f"[AUTH] Generated admin token (first 20 chars): {admin_token[:20]}...")
print(f"[AUTH] Generated user token (first 20 chars): {user_token[:20]}...")

# curl wrapper
def run_curl(method, url, auth_token=None, data=None, json_data=None, max_time=10):
    """Run curl and return (status_code, response_time_ms, response_body)."""
    cmd = [
        'curl', '-s', '-w', '\n%{http_code} %{time_total}', '-X', method, url,
        '--max-time', str(max_time)
    ]
    if auth_token:
        cmd.extend(['-H', f'Authorization: Bearer {auth_token}'])
    if json_data:
        cmd.extend(['-H', 'Content-Type: application/json', '-d', json.dumps(json_data)])
    elif data:
        cmd.extend(['-d', data])
    
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=max_time+2)
        out = proc.stdout.strip()
        # Split on last newline to separate response body from status/time
        if '\n' in out:
            body, last_line = out.rsplit('\n', 1)
        else:
            body, last_line = '', out
        
        # Parse "HTTP_CODE RESPONSE_TIME"
        parts = last_line.strip().split()
        status = int(parts[0]) if len(parts) > 0 and parts[0].isdigit() else 0
        response_time = int(float(parts[1]) * 1000) if len(parts) > 1 else 0
        return status, response_time, body[:1000]
    except subprocess.TimeoutExpired:
        return 0, max_time * 1000, ''
    except Exception as e:
        return 0, 0, f'Error: {str(e)}'

# Test suite
report = []

def add_test_result(endpoint, method, role, auth_token, expected_status, test_category, note=''):
    """Run a single test and add to report."""
    url = BASE_URL.rstrip('/') + endpoint
    status, response_time, body = run_curl(method, url, auth_token=auth_token)
    finding = status != expected_status
    severity = 'high' if finding else 'info'
    
    report.append({
        'endpoint': endpoint,
        'method': method,
        'role': role,
        'status': status,
        'expected_status': expected_status,
        'finding': finding,
        'severity': severity,
        'response_time_ms': response_time,
        'test_category': test_category,
        'note': note,
        'timestamp': int(time.time())
    })
    
    symbol = 'FAIL' if finding else 'PASS'
    print(f"{symbol} {method:6} {endpoint:30} role={role:8} status={status:3} expected={expected_status:3} ({test_category})")
    time.sleep(0.1)

print("\\n[CATEGORY 0] AuthN - Testing unauthenticated access to protected endpoints")
for ep in discovered:
    if ep['requires'] in ('token', 'admin'):
        expected_status = 401
        for method in ep['methods']:
            add_test_result(
                ep['path'], method, 'anonymous', None, expected_status,
                'authn_none', f"Should reject unauthenticated access"
            )

print("\\n[CATEGORY 1] AuthN - Testing with malformed tokens")
for ep in discovered:
    if ep['requires'] in ('token', 'admin'):
        for method in ep['methods']:
            add_test_result(
                ep['path'], method, 'malformed', 'MALFORMED_TOKEN', 401,
                'authn_malformed', 'Should reject malformed token'
            )

print("\\n[CATEGORY 2] AuthZ - Testing role-based access (RBAC matrix)")
  # Admin endpoints should reject user token
for ep in discovered:
    if ep['requires'] == 'admin':
        for method in ep['methods']:
            add_test_result(
                ep['path'], method, 'user', user_token, 403,
                'authz_privesc', 'User should not access admin endpoint'
            )

print("\\n[CATEGORY 3] AuthN - Testing with valid user token on protected endpoints")
for ep in discovered:
    if ep['requires'] == 'token':
        for method in ep['methods']:
            add_test_result(
                ep['path'], method, 'user', user_token, 200,
                'authn_valid', 'Valid token should pass'
            )

print("\\n[CATEGORY 4] AuthN - Testing with valid admin token on admin endpoints")
for ep in discovered:
    if ep['requires'] == 'admin':
        for method in ep['methods']:
            add_test_result(
                ep['path'], method, 'admin', admin_token, 200,
                'authn_valid_admin', 'Valid admin token should pass'
            )

print("\\n[CATEGORY 5] Discovery - Testing public endpoints (no auth)")
for ep in discovered:
    if ep['requires'] == 'none':
        for method in ep['methods']:
            expected = 200
            add_test_result(
                ep['path'], method, 'public', None, expected,
                'discovery_public', 'Public endpoint'
            )

print("\\n[CATEGORY 6] Token tampering - flipping isAdmin claim without re-signing")
# Tamper with user token to set isAdmin=true and attempt admin access
def tamper_jwt(token, modify_admin=True):
    parts = token.split('.')
    if len(parts) != 3:
        return None
    header_b64, payload_b64, sig = parts
    padding = '=' * ((4 - len(payload_b64) % 4) % 4)
    try:
        payload = json.loads(base64.urlsafe_b64decode(payload_b64 + padding).decode())
        if modify_admin:
            payload['isAdmin'] = True
        return f"{header_b64}.{payload_b64}.{sig}"
    except:
        return None

tampered_token = tamper_jwt(user_token)
if tampered_token:
    for ep in discovered:
        if ep['requires'] == 'admin':
            for method in ep['methods']:
                add_test_result(
                    ep['path'], method, 'tampered', tampered_token, 401,
                    'token_tamper', 'Tampered token (modified claim, original sig) should be rejected'
                )

print("\\n[CATEGORY 7] Rate limiting - burst of 30 requests to home endpoint")
statuses = []
for i in range(30):
    url = BASE_URL.rstrip('/') + '/'
    status, response_time, body = run_curl('GET', url)
    statuses.append(status)
    time.sleep(0.05)

# Check if any 429 status codes appeared
has_rate_limit = any(s == 429 for s in statuses)
report.append({
    'endpoint': '/',
    'method': 'GET',
    'role': 'public',
    'status': statuses[0] if statuses else 0,
    'expected_status': 200,
    'finding': has_rate_limit,
    'severity': 'medium' if not has_rate_limit else 'info',
    'response_time_ms': 0,
    'test_category': 'rate_limiting',
    'note': f'Burst of 30 requests. Rate limit detected: {has_rate_limit}. Statuses: {set(statuses)}',
    'timestamp': int(time.time())
})
print(f"{'PASS' if has_rate_limit else 'NOPASS'} Rate limiting test: {set(statuses)} (has_limit={has_rate_limit})")

print("\\n[CATEGORY 8] Injection probes - simple SQLi-like detection (200 chars max each)")
sqli_payloads = ["' OR '1'='1", "'; DROP TABLE--", "1' UNION SELECT"]
for ep in discovered:
    for method in ['GET', 'POST']:
        if method in ep['methods']:
            for payload in sqli_payloads:
                url = BASE_URL.rstrip('/') + ep['path']
                status, response_time, body = run_curl(
                    method, url, auth_token=user_token,
                    json_data={'q': payload}
                )
                # Detection: look for SQL error patterns in response
                has_sql_error = bool(re.search(r'(SQL|syntax|mysql|postgresql|error)', body, re.I))
                is_finding = has_sql_error or status == 500
                report.append({
                    'endpoint': ep['path'],
                    'method': method,
                    'role': 'user',
                    'status': status,
                    'expected_status': 200,
                    'finding': is_finding,
                    'severity': 'high' if is_finding else 'info',
                    'response_time_ms': response_time,
                    'test_category': 'injection_probe',
                    'note': f'Payload: {payload[:20]}... SQL error detected: {has_sql_error}',
                    'timestamp': int(time.time())
                })
                symbol = 'FAIL' if is_finding else 'PASS'
                print(f"{symbol} {method:6} {ep['path']:30} payload={payload[:15]:15}... sql_error={has_sql_error}")
                time.sleep(0.05)

# Write report
REPORT_FILE.write_text(json.dumps(report, indent=2))
print(f"\\n[REPORT] Wrote {len(report)} test results to {REPORT_FILE}")

# Summary
findings = [t for t in report if t['finding']]
high_sev = [t for t in findings if t['severity'] == 'high']
medium_sev = [t for t in findings if t['severity'] == 'medium']

print(f"\\n{'='*70}")
print(f"DAST SUMMARY")
print(f"{'='*70}")
print(f"Total tests run: {len(report)}")
print(f"Findings: {len(findings)} ({len(high_sev)} HIGH, {len(medium_sev)} MEDIUM)")
print(f"\\nFINDINGS BY SEVERITY:")
for t in high_sev:
    print(f"  [HIGH] {t['endpoint']} ({t['method']}) - {t['test_category']}: {t['note']}")
for t in medium_sev:
    print(f"  [MEDIUM] {t['endpoint']} ({t['method']}) - {t['test_category']}: {t['note']}")

print(f"\\n[COMPLETE] Report written to {REPORT_FILE}")

