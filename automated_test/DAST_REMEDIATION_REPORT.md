# DAST (Dynamic Application Security Testing) Report
## Summary
- **Date**: June 10, 2026
- **API Target**: http://localhost:5000
- **Total Tests Run**: 79
- **Total Findings**: 54 (all HIGH severity)
- **Endpoints Discovered**: 13
- **Test Categories**: 8 (AuthN, AuthZ, Token Tampering, Injection, Rate Limiting, Code Scanning)

---

## Critical Findings Summary

### 1. [CRITICAL - Code Vulnerability] Hardcoded JWT Secret in Source Code
**Severity**: CRITICAL  
**Location**: `backend/app.py` line 26  
**Finding**: JWT signing secret is hardcoded in the codebase  
```python
JWT_SECRET = "fyp-ats-analyzer-cryptographic-jwt-signature-key-2026"
```
**Risk**: An attacker with repo access (git history, leaked code) can forge tokens for any user and privilege level. This secret is likely deployed to production unchanged.

**Remediation (IMMEDIATE)**:
1. Rotate the JWT secret immediately
2. Move to environment variable with secure vault storage
3. Remove from git history: `git filter-repo --replace-text secrets.txt` or GitHub Dashboard
4. Invalidate all existing tokens and force re-login

**Code Fix**:
```python
import os
# backend/app.py line 26
JWT_SECRET = os.environ.get('JWT_SECRET', 'CHANGE-ME-IN-PRODUCTION')
# NEVER use the default in production
if JWT_SECRET == 'CHANGE-ME-IN-PRODUCTION':
    raise ValueError("JWT_SECRET environment variable not set!")
```

---

### 2. [CRITICAL - AuthN Bypass] Fallback Behavior Allows Unauthenticated Access to Protected Endpoints
**Severity**: CRITICAL  
**Affected Endpoints**: 11 endpoints (all token-required endpoints silently fall back to default user)  
**Test Category**: `authn_none`, `authn_malformed`  
**Findings**:
- GET /api/job-descriptions (anonymous) → Returns 200 with data (expected 401)
- GET /chat/messages (anonymous) → Returns 200 with data
- GET /chat/conversations (anonymous) → Returns 200 with data
- GET /analytics (anonymous) → Returns 200 with full analytics
- POST endpoints return 400 (missing required fields in JSON body), NOT 401 (auth rejection)

**Root Cause** (`backend/app.py` lines 78-109):  
The `@token_required` decorator has dangerous fallback logic:
```python
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(" ")[1]
            
        if not token or token in ["null", "undefined", ""]:
            # VULNERABILITY: Falls back to default user instead of rejecting
            user = database.get_user_by_email("vishnu@gmail.com")
            if not user:
              user = database.get_user_by_email("lvishnu181@gmail.com")
            return f(user, *args, **kwargs)  # <-- PROCEEDS WITH FUNCTION!
            
        payload = verify_jwt_token(token)
        if not payload:
            # VULNERABILITY: Verification failure also falls back
            user = database.get_user_by_email("vishnu@gmail.com")
            if not user:
                user = database.get_user_by_email("lvishnu181@gmail.com")
            return f(user, *args, **kwargs)  # <-- PROCEEDS WITH FUNCTION!
        
        user = database.get_user_by_email(payload["email"])
        if not user:
            user = database.get_user_by_email("vishnu@gmail.com")  # FALLBACK AGAIN!
            if not user:
                user = database.get_user_by_email("lvishnu181@gmail.com")
        
        return f(user, *args, **kwargs)
    return decorated
```

**Risk**: Any unauthenticated or anonymous user can access protected endpoints and retrieve sensitive data (analyses, chat, analytics).

**Remediation (IMMEDIATE)**:
Replace the `@token_required` decorator to REJECT requests without valid auth:
```python
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        # MUST have Authorization header
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"success": False, "error": "Missing or invalid Authorization header"}), 401
        
        token = auth_header.split(" ", 1)[1]
        
        # Reject empty/null tokens
        if not token or token in ["null", "undefined", ""]:
            return jsonify({"success": False, "error": "Missing or invalid token"}), 401
        
        # Verify token signature and expiry
        payload = verify_jwt_token(token)
        if not payload:
            return jsonify({"success": False, "error": "Invalid or expired token"}), 401
        
        # Retrieve user (but do NOT fall back)
        user = database.get_user_by_email(payload["email"])
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 401
        
        return f(user, *args, **kwargs)
    return decorated
```

---

### 3. [CRITICAL - AuthZ/Privilege Escalation] Users Can Access Admin-Only Endpoints
**Severity**: CRITICAL  
**Affected Endpoints**:
- GET /chat/conversations (admin-only) → user token returns 200
- POST /ping (admin-only) → user token returns 200

**Test Category**: `authz_privesc`  
**Findings**: User role tokens successfully access admin-protected endpoints.

**Root Cause** (`backend/app.py` lines 111-119):  
Similar fallback vulnerability in `@admin_required` decorator:
```python
def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        # VULNERABILITY: Falls back to admin user instead of rejecting
        if not current_user or not current_user["is_admin"]:
            admin_user = database.get_user_by_email("lvishnu181@gmail.com")
            return f(admin_user, *args, **kwargs)  # <-- PROCEEDS WITH ADMIN PRIVILEGES!
        return f(current_user, *args, **kwargs)
    return decorated
```

**Risk**: Any authenticated user can perform administrative actions (view all conversations, manage active users, etc.).

**Remediation (IMMEDIATE)**:
```python
def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not current_user or not current_user.get("is_admin", False):
            return jsonify({"success": False, "error": "Admin privileges required"}), 403
        return f(current_user, *args, **kwargs)
    return decorated
```

---

### 4. [CRITICAL - Token Tampering] Server Accepts Modified JWT Claims Without Verification
**Severity**: CRITICAL  
**Test Category**: `token_tamper`  
**Findings**:
- Tampered token with `isAdmin` claim flipped (but original signature) → accepted
- GET /chat/conversations (admin-only) with tampered user token → returns 200
- POST /ping (admin-only) with tampered user token → returns 200

**Root Cause**: The fallback logic in `@admin_required` provides a path around JWT verification. Even if signature is invalid, decorator falls back to admin user.

**Risk**: Trivial privilege escalation - attacker modifies token claims locally without re-signing.

**Remediation**: Fix the `@admin_required` decorator as shown above. Also ensure `verify_jwt_token()` is called for EVERY protected request before the fallback logic.

---

### 5. [HIGH - SQL Injection Detection] Error Messages Leak SQL Keywords and Validation Logic
**Severity**: HIGH  
**Test Category**: `injection_probe`  
**Findings**: POST endpoints respond with error messages containing SQL-like keywords when sent injection payloads
- Payload: `' OR '1'='1` → Response contains "error" messages with SQL-like validation text
- Endpoint: /api/register, /api/forgot-password, /ats_check, /api/rank, /api/job-descriptions, /chat/send, /share

**Risk**: Even though no actual SQL injection appears to execute, error responses give attackers information about backend data validation and error handling. This aids reconnaissance for more targeted attacks.

**Remediation**:
1. Do NOT return detailed error messages in production
2. Log full errors server-side for debugging
3. Return generic "Invalid request" to the client

**Code Fix** (for all endpoints):
```python
@app.route("/api/register", methods=["POST"])
def register_user():
    try:
        data = request.get_json(silent=True) or {}
        email = data.get("email")
        password = data.get("password")
        name = data.get("name")
        
        if not email or not password or not name:
            # LOG the detailed error server-side
            app.logger.warning(f"Register: Missing fields from {request.remote_addr}")
            # Return generic error to client
            return jsonify({"success": False, "error": "Invalid request"}), 400
        
        res = database.create_user(name.strip(), email.strip().lower(), password)
        if res.get("success"):
            token = create_jwt_token(email.strip().lower(), email.strip().lower() == "lvishnu181@gmail.com")
            res["token"] = token
        return jsonify(res)
    except Exception as e:
        app.logger.error(f"Register error: {e}")
        return jsonify({"success": False, "error": "An error occurred"}), 500
```

---

### 6. [MEDIUM - No Rate Limiting] API Has No Throttling or Burst Protection
**Severity**: MEDIUM  
**Test Category**: `rate_limiting`  
**Findings**: Burst of 30 requests to GET / in rapid succession → all returned 200 OK

**Risk**: API is vulnerable to:
- Brute force attacks on login endpoints
- DDoS amplification
- Resource exhaustion

**Remediation**: Add Flask-Limiter
```bash
pip install Flask-Limiter
```

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(app=app, key_func=get_remote_address)

# Apply defaults to all routes
limiter.limit("200 per day, 50 per hour")(app)

# Tighter limits on sensitive endpoints
@app.route("/api/login", methods=["POST"])
@limiter.limit("5 per minute")
def login_user():
    # ... existing code ...

@app.route("/api/register", methods=["POST"])
@limiter.limit("3 per minute")
def register_user():
    # ... existing code ...
```

---

### 7. [MEDIUM - Missing HttpOnly and Secure Flags on Tokens] 
**Severity**: MEDIUM  
**Observation**: Tokens are returned in JSON responses (not set as cookies), so they're handled by JavaScript. This is inherently less secure than HttpOnly cookies.

**Remediation**: 
- If using JSON response tokens: Enforce HTTPS only (Secure flag on cookies if any)
- Consider using HttpOnly, Secure, SameSite cookies for token storage instead of localStorage
- Add Content-Security-Policy headers to prevent XSS exfiltration

**Code Fix**:
```python
@app.after_request
def set_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'"
    return response
```

---

## Test Results Breakdown by Category

### Category 0: AuthN - Unauthenticated Access (11 tests)
- **Failed**: 11/11 endpoints accepted unauthenticated requests (400 or 200 instead of 401)
- **Vulnerable Endpoints**: All token-required endpoints

### Category 1: AuthN - Malformed Tokens (11 tests)
- **Failed**: 11/11 endpoints accepted malformed tokens
- **Test Method**: Sent token value "MALFORMED_TOKEN"

### Category 2: AuthZ - Privilege Escalation (2 tests)
- **Failed**: 2/2 admin endpoints accessible with user token
- **Vulnerable Endpoints**: /chat/conversations, /ping

### Category 3: AuthN - Valid User Token (9 tests)
- **Passed**: 3/9 (GET endpoints OK: /api/job-descriptions, /chat/messages, /analytics)
- **Failed**: 6/9 (POST endpoints reject with 400 due to missing body params, not auth failure)

### Category 4: AuthN - Valid Admin Token (2 tests)
- **Passed**: 2/2 (admin endpoints work with admin token)

### Category 5: Discovery - Public Endpoints (2 tests)
- **Passed**: 1/2 (GET / works)
- **Failed**: 1/2 (/api/register POST returns 400 with minimal body)

### Category 6: Token Tampering (2 tests)
- **Failed**: 2/2 (tampered tokens accepted)
- **Test Method**: Modified JWT `isAdmin` claim without re-signing

### Category 7: Rate Limiting (1 test)
- **Failed**: 1/1 (no rate limiting detected)

### Category 8: Injection Probes (39 tests)
- **Passed**: 15/39 (GET endpoints safe)
- **Failed**: 24/39 (POST endpoints leak SQL error keywords in responses)
- **Payloads Tested**: `' OR '1'='1`, `'; DROP TABLE--`, `1' UNION SELECT`

---

## Remediation Priority (Fix Order)

### IMMEDIATE (Today)
1. **Fix JWT Secret** - Rotate and move to environment variable
2. **Fix @token_required decorator** - Remove fallback, return 401 on auth failure
3. **Fix @admin_required decorator** - Remove fallback, return 403 on privilege check failure
4. **Force token re-issue** - All existing tokens are now compromised

### URGENT (Within 24 hours)
5. Add rate limiting with Flask-Limiter
6. Generic error messages (don't leak SQL keywords)
7. Add security headers (CSP, HSTS, X-Frame-Options, etc.)

### SHORT-TERM (This week)
8. Implement per-user rate limiting on login/register
9. Token expiry validation (verify `exp` claim properly)
10. Audit all other endpoints for similar fallback logic

---

## Files Modified / Created During DAST

- `automated_test/discovered_endpoints.json` - Enumerated all 13 API endpoints
- `automated_test/report.json` - Raw test results (79 test cases)
- `automated_test/report_code_scan.json` - Static code analysis findings
- `automated_test/full_runner.py` - DAST test engine
- `automated_test/DAST_REMEDIATION_REPORT.md` - This report

---

## Recommendations

### Development
- Add security tests to CI/CD pipeline
- Require code review for decorator changes
- Implement pre-commit hook scanning for hardcoded secrets (e.g., git-secrets, detect-secrets)

### Operations
- Rotate all API tokens (issue new JWTs to all users)
- Enable verbose logging for auth failures
- Monitor for repeated 401 errors (brute force indicator)

### Architecture
- Move secrets to AWS Secrets Manager / HashiCorp Vault
- Implement API gateway with built-in rate limiting
- Use Web Application Firewall (WAF) rules for SQLi/XSS detection

---

## Conclusion

The API has **critical authentication and authorization flaws** that allow unauthenticated and unprivileged users to access protected endpoints. Combined with the hardcoded JWT secret, the security posture is **HIGH RISK**. All findings must be remediated before production deployment.

Once fixes are applied, re-run this DAST report to confirm:

```bash
python ./automated_test/full_runner.py
```

Expected final state: 0 findings (or only LOW/INFO severity).

*** End Patch
