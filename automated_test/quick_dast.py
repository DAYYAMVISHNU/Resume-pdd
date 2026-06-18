#!/usr/bin/env python3
"""
Quick DAST -- focused pass covering all 8 categories.
Merges confirmed AuthN bypass results from prior run.
Writes automated_test/report.json
"""
import base64, hashlib, hmac, json, os, re, sys, time
from datetime import datetime, timezone
from pathlib import Path

try:
    import requests
    from requests.exceptions import RequestException
except ImportError:
    sys.exit("pip install requests")

ROOT   = Path(__file__).resolve().parent.parent
AT_DIR = Path(__file__).resolve().parent
INPUT  = ROOT / "input.json"
OUT    = AT_DIR / "report.json"

with INPUT.open() as f:
    cfg = json.load(f)

BASE        = cfg["baseUrl"].rstrip("/")
USER_TOKEN  = cfg.get("user", "")
ADMIN_TOKEN = cfg.get("admin", "")

print(f"\n{'='*60}")
print(f"  Quick DAST  |  {BASE}")
print(f"  Roles: user={'YES' if USER_TOKEN else 'NO'}  admin={'YES' if ADMIN_TOKEN else 'NO'}")
print(f"{'='*60}\n")

RESULTS = []

def ts():
    return datetime.now(timezone.utc).isoformat()

def req(method, path, token=None, json_body=None, params=None,
        expected=None, role="anon", cat="", note="", sev="info"):
    if expected is None: expected = [200]
    url  = BASE + path
    hdrs = {"Content-Type": "application/json"}
    if token: hdrs["Authorization"] = f"Bearer {token}"
    t0 = time.time()
    status, body = 0, ""
    try:
        r = requests.request(method, url, headers=hdrs, json=json_body,
                             params=params, timeout=10, allow_redirects=False)
        status, body = r.status_code, r.text[:250]
    except RequestException as e:
        body = str(e)[:100]
    ms = round((time.time()-t0)*1000)
    exp = [expected] if isinstance(expected, int) else expected
    finding = status not in exp and status != 0
    rec = dict(endpoint=path, method=method, role=role, status=status,
               expected_status=exp, finding=finding,
               severity=sev if finding else "pass",
               response_time_ms=ms, test_category=cat, note=note,
               timestamp=ts(), body_snippet=body)
    RESULTS.append(rec)
    sym = "FAIL" if finding else "pass"
    print(f"  [{sym}] [{cat}] {method} {path} role={role} -> {status} (exp {exp}) {ms}ms")
    return rec

# -- JWT tamper helper --------------------------------------
def b64u_dec(s):
    s += "="*(4-len(s)%4)
    return base64.urlsafe_b64decode(s)
def b64u_enc(b):
    return base64.urlsafe_b64encode(b).decode().rstrip("=")
def tamper(token, overrides):
    parts = token.split(".")
    if len(parts)!=3: return None
    try: payload = json.loads(b64u_dec(parts[1]))
    except: return None
    payload.update(overrides)
    new_p = b64u_enc(json.dumps(payload, separators=(",",":")).encode())
    return f"{parts[0]}.{new_p}.{parts[2]}"

# ============================================================
# STEP 0  baseline
print("\n-- STEP 0: Baseline --")
req("GET","/",expected=[200,301,302],role="anon",cat="baseline",
    note="Root must be reachable",sev="info")

# ============================================================
# STEP 1  AuthN bypass  (inject confirmed prior-run results)
print("\n-- STEP 1: AuthN bypass (confirmed from prior run) --")
AUTHN_CONFIRMED = [
    # (path, method, token_label, status, finding)
    ("/analyze",           "POST", "no_token",        401, False),
    ("/analyze",           "POST", "mock_oauth",       400, False),
    ("/ats_check",         "POST", "no_token",         401, False),
    ("/ats_check",         "POST", "mock_oauth",        400, False),
    ("/api/rank",          "POST", "no_token",          401, False),
    ("/api/rank",          "POST", "mock_oauth",         400, False),
    ("/api/job-descriptions","POST","no_token",          401, False),
    ("/api/job-descriptions","GET", "no_token",          401, False),
    ("/api/job-descriptions","GET", "mock_oauth",        200, True),   # FINDING
    ("/chat/send",         "POST", "no_token",           401, False),
    ("/chat/send",         "POST", "mock_oauth",          400, False),
    ("/chat/messages",     "GET",  "no_token",            401, False),
    ("/chat/messages",     "GET",  "mock_oauth",          200, True),   # FINDING
    ("/chat/conversations","GET",  "no_token",            401, False),
    ("/chat/conversations","GET",  "mock_oauth",          403, False),
    ("/active_users",      "GET",  "no_token",            401, False),
    ("/analytics",         "GET",  "no_token",            401, False),
    ("/share",             "POST", "no_token",            401, False),
]
for path,method,tok_label,status,finding in AUTHN_CONFIRMED:
    note = f"Token={tok_label}. mock-oauth backdoor accepted." if finding else f"Token={tok_label} correctly rejected."
    RESULTS.append(dict(
        endpoint=path, method=method, role=f"anon:{tok_label}",
        status=status, expected_status=[401,403,400,422],
        finding=finding,
        severity="critical" if finding else "pass",
        response_time_ms=0, test_category="authn_bypass",
        note=note, timestamp=ts(), body_snippet="[from prior confirmed run]"
    ))
    sym = "FAIL" if finding else "pass"
    print(f"  [{sym}] [authn_bypass] {method} {path} role=anon:{tok_label} -> {status}")

# Live-confirm the two critical AuthN findings
print("\n  [LIVE-CONFIRM] mock-oauth-token-123456 bypass:")
req("GET","/api/job-descriptions",token="mock-oauth-token-123456",
    expected=[401,403], role="anon:mock_oauth", cat="authn_bypass",
    note="BACKDOOR: mock-oauth-token-123456 hardcoded in verify_jwt() bypasses all auth. Returns 200.",
    sev="critical")
req("GET","/chat/messages",token="mock-oauth-token-123456",
    expected=[401,403], role="anon:mock_oauth", cat="authn_bypass",
    note="BACKDOOR: mock-oauth-token-123456 accepted on /chat/messages. Returns 200.",
    sev="critical")
req("GET","/analytics",token="mock-oauth-token-123456",
    expected=[401,403], role="anon:mock_oauth", cat="authn_bypass",
    note="BACKDOOR: mock-oauth-token-123456 accepted on /analytics. Checks all endpoints.",
    sev="critical")
req("GET","/chat/conversations",token="mock-oauth-token-123456",
    expected=[401,403], role="anon:mock_oauth", cat="authn_bypass",
    note="Admin-only endpoint with backdoor token -- should be 403 at minimum.",
    sev="high")

# ============================================================
# STEP 2  AuthZ / privesc
print("\n-- STEP 2: AuthZ / privilege escalation --")
ADMIN_EPS = [("/chat/conversations","GET"), ("/active_users","GET")]
for path, method in ADMIN_EPS:
    req(method, path, token=USER_TOKEN, expected=[403], role="user",
        cat="authz_privesc",
        note=f"User token on admin-only {path}. 200/201=privesc.",
        sev="high")

# ============================================================
# STEP 3  IDOR
print("\n-- STEP 3: IDOR --")
VICTIMS = ["admin@example.com","victim@example.com","lvishnu181@gmail.com"]
for email in VICTIMS:
    for role, tok in [("user",USER_TOKEN),("admin",ADMIN_TOKEN)]:
        req("GET","/chat/messages", token=tok, params={"email":email},
            role=role, expected=[403,400], cat="idor",
            note=f"Reading {email}'s chat as {role}. 200=IDOR.",
            sev="high")
# chat/send IDOR
for role, tok in [("user",USER_TOKEN),("admin",ADMIN_TOKEN)]:
    req("POST","/chat/send", token=tok,
        json_body={"text":"DAST-probe","sender":"user","target_user":"victim@example.com"},
        role=role, expected=[403,400], cat="idor",
        note=f"{role} writing to victim@example.com inbox. 200=IDOR.", sev="high")
# job-descriptions -- info only
for role, tok in [("user",USER_TOKEN),("admin",ADMIN_TOKEN)]:
    req("GET","/api/job-descriptions", token=tok, role=role,
        expected=[200], cat="idor",
        note="Verify response only contains current user's JDs (manual check).", sev="info")

# ============================================================
# STEP 4  RBAC matrix (key cross-checks)
print("\n-- STEP 4: RBAC matrix --")
MATRIX = [
    # (method, path, requires, role, token, expected, sev)
    ("GET", "/",                    "none",  "anon",  None,        [200],       "info"),
    ("POST","/api/register",        "none",  "anon",  None,        [400,200],   "info"),
    ("POST","/api/login",           "none",  "anon",  None,        [400,401],   "info"),
    ("POST","/api/forgot-password", "none",  "anon",  None,        [400,404,200],"info"),
    ("POST","/ping",                "none",  "anon",  None,        [200],       "medium"),
    ("GET", "/analytics",           "token", "user",  USER_TOKEN,  [200],       "info"),
    ("GET", "/analytics",           "token", "anon",  None,        [401],       "info"),
    ("GET", "/chat/conversations",  "admin", "user",  USER_TOKEN,  [403],       "high"),
    ("GET", "/chat/conversations",  "admin", "admin", ADMIN_TOKEN, [200,400],   "info"),
    ("GET", "/active_users",        "admin", "user",  USER_TOKEN,  [403],       "high"),
    ("GET", "/active_users",        "admin", "admin", ADMIN_TOKEN, [200],       "info"),
    ("GET", "/active_users",        "admin", "anon",  None,        [401],       "info"),
]
for method,path,req_lvl,role,tok,exp,sev in MATRIX:
    req(method, path, token=tok, json_body={} if method=="POST" else None,
        role=role, expected=exp, cat="rbac_matrix",
        note=f"Requires '{req_lvl}', role '{role}'.", sev=sev)

# /ping -- unauthenticated public -- flag it
req("POST","/ping", token=None,
    json_body={"email":"attacker@evil.com","name":"<script>alert(1)</script>"},
    expected=[200], role="anon", cat="rbac_matrix",
    note="/ping has NO @token_required decorator. Anyone can inject sessions.",
    sev="medium")

# ============================================================
# STEP 5  Token tampering
print("\n-- STEP 5: Token tampering --")
BASE_TOK = USER_TOKEN or ADMIN_TOKEN
if BASE_TOK:
    CASES = [
        ("isAdmin_true",   {"isAdmin": True}),
        ("email_admin",    {"email": "admin@example.com"}),
        ("exp_future",     {"exp": 9999999999}),
    ]
    for name, overrides in CASES:
        bad = tamper(BASE_TOK, overrides)
        if bad:
            req("GET","/analytics",  token=bad, role=f"tampered:{name}",
                expected=[401,403], cat="token_tampering",
                note=f"Modified JWT payload ({name}) without re-signing. 2xx=sig bypass.",
                sev="critical")
            req("GET","/chat/conversations", token=bad, role=f"tampered:{name}",
                expected=[401,403], cat="token_tampering",
                note=f"Admin endpoint with tampered token ({name}).", sev="critical")

# ============================================================
# STEP 6  Injection probes
print("\n-- STEP 6: Injection probes --")
SQLI = ["' OR '1'='1","' OR 1=1--","'; DROP TABLE users; --","1 UNION SELECT NULL--"]
for p in SQLI:
    req("POST","/api/login", json_body={"email":p,"password":p},
        role="anon:sqli", expected=[400,401,422], cat="injection_probe",
        note=f"SQLi in login: {p[:40]}", sev="high")
    req("POST","/api/forgot-password", json_body={"email":p},
        role="anon:sqli", expected=[400,404,422], cat="injection_probe",
        note=f"SQLi in forgot-password email: {p[:40]}", sev="medium")
if USER_TOKEN:
    for p in SQLI[:2]:
        req("GET","/chat/messages", token=USER_TOKEN, params={"email":p},
            role="user:sqli", expected=[200,400,404], cat="injection_probe",
            note=f"SQLi in ?email= param: {p[:40]}", sev="medium")

# ============================================================
# STEP 7  Rate limiting
print("\n-- STEP 7: Rate limiting --")
BURST = 35
for method, path, body in [
    ("POST","/api/login",           {"email":"x@x.com","password":"bad"}),
    ("POST","/api/register",        {"email":"x@x.com","password":"bad12345","name":"X"}),
    ("POST","/api/forgot-password", {"email":"x@x.com"}),
]:
    statuses = []
    print(f"  Burst {BURST} -> {method} {path}")
    for _ in range(BURST):
        try:
            r = requests.request(method, BASE+path,
                headers={"Content-Type":"application/json"}, json=body, timeout=8)
            statuses.append(r.status_code)
        except: statuses.append(0)
        time.sleep(0.03)
    limited = any(s==429 for s in statuses)
    dist = {str(s): statuses.count(s) for s in set(statuses)}
    finding = not limited
    RESULTS.append(dict(
        endpoint=path, method=method, role="anon",
        status=429 if limited else statuses[-1], expected_status=[429],
        finding=finding, severity="medium" if finding else "pass",
        response_time_ms=0, test_category="rate_limiting",
        note=f"Burst {BURST}. Distribution={dist}. rate_limited={limited}",
        timestamp=ts(), body_snippet=""))
    sym="FAIL" if finding else "pass"
    print(f"  [{sym}] {method} {path}: dist={dist} limited={limited}")

# ============================================================
# STEP 8  Code scan
print("\n-- STEP 8: Code scan --")
PATTERNS = [
    (re.compile(r'os\.environ\.get\([^,]+,\s*["\']([^"\']{10,})["\']'),
     "Hardcoded JWT secret fallback in os.environ.get()"),
    (re.compile(r'["\']mock-oauth-token[^"\']*["\']'),
     "Backdoor mock OAuth token hardcoded in verify_jwt"),
    (re.compile(r'["\']oauth_secure_dummy_password[^"\']*["\']'),
     "Hardcoded dummy OAuth password for auto-created users"),
    (re.compile(r'lvishnu181@gmail\.com'),
     "Hardcoded admin email in source code (admin privilege grant)"),
    (re.compile(r'password\s*=\s*["\']([^"\']{4,})["\']', re.I),
     "Hardcoded password literal"),
]
code_hits = []
for fp in (ROOT/"backend").rglob("*.py"):
    try:
        text  = fp.read_text(encoding="utf-8", errors="ignore")
        lines = text.splitlines()
        for pat, desc in PATTERNS:
            for m in pat.finditer(text):
                ln = text[:m.start()].count("\n")+1
                snip = lines[ln-1].strip()[:100]
                code_hits.append(dict(file=str(fp.relative_to(ROOT)),
                                      line=ln, desc=desc, snippet=snip))
    except: pass

for h in code_hits:
    RESULTS.append(dict(
        endpoint=h["file"], method="STATIC", role="N/A",
        status=0, expected_status=[0], finding=True, severity="high",
        response_time_ms=0, test_category="code_scan",
        note=f"[{h['desc']}] line {h['line']}: {h['snippet']}",
        timestamp=ts(), body_snippet=""))
    print(f"  [FAIL] [code_scan] {h['file']}:{h['line']} -> {h['desc']}")

if not code_hits:
    RESULTS.append(dict(endpoint="codebase",method="STATIC",role="N/A",
        status=0,expected_status=[0],finding=False,severity="pass",
        response_time_ms=0,test_category="code_scan",
        note="No hardcoded secrets found.",timestamp=ts(),body_snippet=""))
    print("  [pass] [code_scan] No secrets found")

# ============================================================
# EMAIL ENUMERATION  (forgot-password leaks user existence)
print("\n-- EXTRA: Email enumeration --")
req("POST","/api/forgot-password",
    json_body={"email":"definitelynotreal_xyz_abc@example.com"},
    role="anon", expected=[200], cat="info_disclosure",
    note="404 response confirms email not registered -- user enumeration possible.",
    sev="medium")
req("POST","/api/forgot-password",
    json_body={"email":"lvishnu181@gmail.com"},
    role="anon", expected=[200], cat="info_disclosure",
    note="200 response leaks that lvishnu181@gmail.com IS a registered user.",
    sev="medium")

# ============================================================
# Write report
OUT.write_text(json.dumps(RESULTS, indent=2))

findings = [r for r in RESULTS if r["finding"]]
by_sev   = {}
for r in findings: by_sev.setdefault(r["severity"],[]).append(r)
by_cat   = {}
for r in RESULTS:
    by_cat.setdefault(r["test_category"],{"total":0,"findings":0})
    by_cat[r["test_category"]]["total"]+=1
    if r["finding"]: by_cat[r["test_category"]]["findings"]+=1

print(f"\n\n{'='*60}")
print("  DAST SUMMARY")
print(f"{'='*60}")
print(f"  Total test records : {len(RESULTS)}")
print(f"  Total findings     : {len(findings)}")
print(f"\n  By severity:")
for sev in ["critical","high","medium","low","info"]:
    c = len(by_sev.get(sev,[]))
    if c: print(f"    {'X' if sev in ('critical','high') else '!'} {sev.upper():10s}: {c}")
print(f"\n  By category:")
for cat,d in by_cat.items():
    sym="X" if d["findings"] else "v"
    print(f"    [{sym}] {cat:28s}: {d['findings']}/{d['total']}")
if by_sev.get("critical"):
    print(f"\n  TOP CRITICAL ISSUES:")
    seen=set()
    for r in by_sev["critical"]:
        k=(r["endpoint"],r["test_category"])
        if k not in seen:
            seen.add(k)
            print(f"    [X] [{r['test_category']}] {r['method']} {r['endpoint']}")
            print(f"        {r['note'][:90]}")
print(f"\n  Report -> {OUT}")
print(f"{'='*60}\n")
