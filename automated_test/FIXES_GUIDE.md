# DAST Security Fixes - Step-by-Step Implementation Guide

## Quick Summary
- **Critical Issues**: 5
- **Tests Failing**: 54 out of 79
- **Est. Fix Time**: 2-4 hours
- **Estimated LOC Changes**: ~100 lines

---

## FIX 1: Hardcoded JWT Secret (Code Scan - CRITICAL)

### Issue
File: `backend/app.py` line 26
```python
JWT_SECRET = "fyp-ats-analyzer-cryptographic-jwt-signature-key-2026"
```
This secret is hardcoded and will be in git history + deployed binaries.

### Step 1a: Generate a new secure secret
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
Output example: `Drmhze6EPcv0fN_81Bj-nA` (copy this)

### Step 1b: Add new secret to environment

**Windows (PowerShell)**:
```powershell
[Environment]::SetEnvironmentVariable("JWT_SECRET", "Drmhze6EPcv0fN_81Bj-nA", "User")
$env:JWT_SECRET = "Drmhze6EPcv0fN_81Bj-nA"
```

**Linux/Mac (bash)**:
```bash
export JWT_SECRET="Drmhze6EPcv0fN_81Bj-nA"
echo 'export JWT_SECRET="Drmhze6EPcv0fN_81Bj-nA"' >> ~/.bashrc
```

### Step 1c: Update backend/app.py
Replace line 26:
```python
# OLD CODE (REMOVE):
JWT_SECRET = "fyp-ats-analyzer-cryptographic-jwt-signature-key-2026"

# NEW CODE (ADD):
JWT_SECRET = os.environ.get('JWT_SECRET')
if not JWT_SECRET:
    raise ValueError("FATAL: JWT_SECRET environment variable not set. Set it before starting the app.")
```

### Step 1d: Remove from git history (one-time)
```bash
cd C:\Users\lvish\Downloads\29752835-0400-467d-9963-386d7b517de0

# Option A (if you can afford to rewrite history):
git filter-branch --force --index-filter "git rm -r --cached --ignore-unmatch --force -- backend/app.py" --prune-empty --tag-name-filter cat -- --all

# Option B (safer - squash into one commit and push to new branch):
git checkout -b security/fix-jwt-secret
# Make the edit above
git add backend/app.py
git commit -m "Fix: Move JWT secret to environment variable (CRITICAL)"
git push origin security/fix-jwt-secret
# Create pull request and merge
```

### Step 1e: Delete old tokens (force re-login)
In the database:
```sql
DELETE FROM sessions WHERE created_at < datetime('now');
-- or if you have a sessions table
UPDATE users SET last_token_issued = NULL;
```

---

## FIX 2: Remove Fallback Logic in @token_required (AuthN Bypass - CRITICAL)

### Issue
File: `backend/app.py` lines 78-109  
Current behavior: If auth fails OR token is invalid, fallback to default user instead of rejecting.

### Current Code (VULNERABLE):
```python
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(" ")[1]
            
        if not token or token in ["null", "undefined", ""]:
            # <<<< VULNERABILITY: No rejection, falls back!
            user = database.get_user_by_email("vishnu@gmail.com")
            if not user:
                user = database.get_user_by_email("lvishnu181@gmail.com")
            return f(user, *args, **kwargs)
            
        payload = verify_jwt_token(token)
        if not payload:
            # <<<< VULNERABILITY: No rejection, falls back!
             user = database.get_user_by_email("vishnu@gmail.com")
            if not user:
                user = database.get_user_by_email("lvishnu181@gmail.com")
            return f(user, *args, **kwargs)
        
        # ... more fallback logic ...
        return f(user, *args, **kwargs)
    return decorated
```

### Fixed Code (SECURE):
Replace the entire `token_required` function with:
```python
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        # REQUIREMENT 1: Must have Authorization header
        if not auth_header:
            return jsonify({"success": False, "error": "Missing Authorization header"}), 401
        
        # REQUIREMENT 2: Must use Bearer scheme
        if not auth_header.startswith('Bearer '):
            return jsonify({"success": False, "error": "Invalid authorization scheme"}), 401
        
        # REQUIREMENT 3: Extract and validate token
        try:
            token = auth_header.split(" ", 1)[1]  # Split only on first space
        except IndexError:
            return jsonify({"success": False, "error": "Malformed authorization header"}), 401
        
        if not token or token in ["null", "undefined", ""]:
            return jsonify({"success": False, "error": "Missing token"}), 401
        
        # REQUIREMENT 4: Verify token (signature + expiry + format)
        payload = verify_jwt_token(token)
        if not payload:
            return jsonify({"success": False, "error": "Invalid or expired token"}), 401
        
        # REQUIREMENT 5: User must exist in database
        user = database.get_user_by_email(payload["email"])
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 401
        
        # REQUIREMENT 6: Only proceed if all checks pass
        return f(user, *args, **kwargs)
    return decorated
```

### Verification
After applying fix:
```bash
# Should return 401:
curl -X GET http://localhost:5000/api/job-descriptions
# Response: {"success": false, "error": "Missing Authorization header"}

# Should return 401 with invalid token:
curl -X GET http://localhost:5000/api/job-descriptions \
  -H "Authorization: Bearer INVALID"
# Response: {"success": false, "error": "Invalid or expired token"}
```

---

## FIX 3: Remove Fallback Logic in @admin_required (AuthZ Bypass - CRITICAL)

### Issue
File: `backend/app.py` lines 111-119  
Current behavior: Non-admin users fall back to admin account instead of being rejected.

### Current Code (VULNERABLE):
```python
def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        # <<<< VULNERABILITY: If not admin, fall back to admin account!
        if not current_user or not current_user["is_admin"]:
            admin_user = database.get_user_by_email("lvishnu181@gmail.com")
            return f(admin_user, *args, **kwargs)  # EXECUTES WITH ADMIN RIGHTS!
        return f(current_user, *args, **kwargs)
    return decorated
```

### Fixed Code (SECURE):
```python
def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        # Check if user exists and has admin flag
        if not current_user or not current_user.get("is_admin", False):
            return jsonify({
                "success": False, 
                "error": "This action requires administrator privileges"
            }), 403
        
        # Only proceed if current_user IS admin
        return f(current_user, *args, **kwargs)
    return decorated
```

### Verification
After applying fix:
```bash
# User token (is_admin=false) on admin endpoint:
curl -X GET http://localhost:5000/chat/conversations \
  -H "Authorization: Bearer <USER_TOKEN>"
# Response: {"success": false, "error": "This action requires administrator privileges"}
# HTTP Status: 403 (Forbidden)
```

---

## FIX 4: Generic Error Messages (SQLi Detection - HIGH)

### Issue
File: `backend/app.py` - all endpoints return detailed error messages  
Current behavior: Error responses leak validation logic and SQL-like patterns.

### Current Code Example (VULNERABLE):
```python
@app.route("/api/register", methods=["POST"])
def register_user():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    
    if not email or not password or not name:
        # <<<< VULNERABILITY: Detailed error message
        return jsonify({"success": False, "error": "Name, email, and password are required credentials"}), 400
```

### Fixed Code (GENERIC ERRORS):
```python
@app.route("/api/register", methods=["POST"])
def register_user():
    try:
        data = request.get_json(silent=True) or {}
        email = data.get("email")
        password = data.get("password")
        name = data.get("name")
        
        if not email or not password or not name:
            # Log detailed error server-side
            app.logger.warning(f"Register: missing fields from {request.remote_addr}")
            # Return generic error to client
            return jsonify({"success": False, "error": "Invalid request"}), 400
        
        res = database.create_user(name.strip(), email.strip().lower(), password)
        if res.get("success"):
            token = create_jwt_token(email.strip().lower(), email.strip().lower() == "lvishnu181@gmail.com")
            res["token"] = token
        return jsonify(res)
    
    except Exception as e:
        # Log full error server-side for debugging
        app.logger.error(f"Register error: {e}", exc_info=True)
        # Return generic error to client
        return jsonify({"success": False, "error": "An error occurred"}), 500
```

### Apply to all endpoints
Do the same for:
- /api/login
- /api/forgot-password
- /analyze
- /ats_check
- /api/rank
- /api/job-descriptions
- /chat/send
- /chat/messages
- /analytics
- /share

---

## FIX 5: Add Rate Limiting (Rate Limiting Detection - MEDIUM)

### Step 1: Install Flask-Limiter
```bash
cd C:\Users\lvish\Downloads\29752835-0400-467d-9963-386d7b517de0
pip install Flask-Limiter
```

### Step 2: Add to `backend/app.py` after imports (line ~23)
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from functools import wraps

# ... existing imports ...

app = Flask(__name__)
CORS(app)

# Rate limiter initialization
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# ... rest of app initialization ...
```

### Step 3: Add strict limits to sensitive endpoints
```python
@app.route("/api/login", methods=["POST"])
@limiter.limit("5 per minute")  # <-- ADD THIS LINE
def login_user():
    # ... existing code ...

@app.route("/api/register", methods=["POST"])
@limiter.limit("3 per minute")  # <-- ADD THIS LINE
def register_user():
    # ... existing code ...

@app.route("/api/forgot-password", methods=["POST"])
@limiter.limit("3 per hour")  # <-- ADD THIS LINE
def forgot_password():
    # ... existing code ...
```

### Step 4: Update requirements.txt
```
Flask==3.0.3
flask-cors==4.0.0
Flask-Limiter==3.5.0
PyPDF2==3.0.1
python-docx==1.1.0
gunicorn==22.0.0
```

### Verification
After applying fix:
```bash
# Try 6 logins rapidly (should fail on 6th):
for i in {1..6}; do
  curl -s -X POST http://localhost:5000/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}' | jq .
  sleep 0.5
done
# 6th request should return: {"error": "429 Too Many Requests"}
```

---

## FIX 6: Add Security Headers (Bonus - MEDIUM)

### Add after app initialization in `backend/app.py`
```python
@app.after_request
def set_security_headers(response):
    """Add security headers to all responses"""
    response.headers['X-Content-Type-Options'] = 'nosniff'  # Prevent MIME sniffing
    response.headers['X-Frame-Options'] = 'DENY'  # Prevent clickjacking
    response.headers['X-XSS-Protection'] = '1; mode=block'  # XSS protection
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'  # Force HTTPS
    response.headers['Content-Security-Policy'] = "default-src 'self';"  # Restrict resource loading
    return response
```

---

## Testing After Fixes

### Re-run DAST suite
```bash
cd C:\Users\lvish\Downloads\29752835-0400-467d-9963-386d7b517de0

# Make sure backend is running
python .\backend\app.py &

# Run all tests
python .\automated_test\full_runner.py 2>&1 | Tee-Object .\test_output.txt
```

### Expected results (post-fix)
- AuthN tests: All PASS (401 on no/invalid auth)
- AuthZ tests: All PASS (403 on privilege escalation)
- Token tampering: All PASS (401 on tampered tokens)
- Rate limiting: PASS (429 on burst)
- Injection probes: PASS (no SQL keywords in error messages)

### Final report
```bash
# Summary from output
Total tests run: 79
Findings: 0 (or only non-exploitable INFO level findings)
```

---

## Deployment Checklist

- [ ] FIX 1: JWT secret in environment variable
- [ ] FIX 2: @token_required decorator refactored
- [ ] FIX 3: @admin_required decorator refactored
- [ ] FIX 4: Generic error messages
- [ ] FIX 5: Rate limiting installed and configured
- [ ] FIX 6: Security headers added
- [ ] Requirements.txt updated
- [ ] DAST re-run shows 0 critical findings
- [ ] Code review (security team)
- [ ] Current tokens invalidated
- [ ] Deployment to staging
- [ ] DAST repeat in staging
- [ ] Deployment to production
- [ ] Monitoring/alerting configured

---

## Timeline

- **Now**: Run DAST (already done ✓)
- **Hour 1**: Apply FIX 1-4 (JWT, decorators, error messages)
- **Hour 1-2**: Test and run DAST again
- **Hour 2**: Apply FIX 5-6 (rate limiting, headers)
- **Hour 2-3**: Final DAST and review
- **Hour 3-4**: Deploy to production

---

## Questions?

Refer back to `DAST_REMEDIATION_REPORT.md` for full technical details of each finding.

*** End Patch
