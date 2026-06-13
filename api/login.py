import json, os, sys, hashlib, hmac, base64, time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
import database

JWT_SECRET = "fyp-ats-analyzer-cryptographic-jwt-signature-key-2026"

def _b64enc(data):
    return base64.urlsafe_b64encode(json.dumps(data, separators=(',',':')).encode()).decode().rstrip('=')

def _make_token(email, is_admin):
    h = {'alg':'HS256','typ':'JWT'}
    p = {'email': email.strip().lower(), 'isAdmin': bool(is_admin), 'exp': time.time()+86400}
    s = f"{_b64enc(h)}.{_b64enc(p)}"
    sig = hmac.new(JWT_SECRET.encode(), s.encode(), hashlib.sha256).hexdigest()
    return f"{s}.{sig}"

def handler(request):
    if request.method == 'OPTIONS':
        from http.server import BaseHTTPRequestHandler
        pass

    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    }

    if request.method == 'OPTIONS':
        return ('', 204, headers)

    try:
        body = request.get_json(silent=True) or {}
        email = (body.get('email') or '').strip().lower()
        password = body.get('password') or ''

        if not email or not password:
            return (json.dumps({'success': False, 'error': 'Email and password required'}), 400, headers)

        database.db_init()
        user = database.get_user_by_email(email)
        if not user or not database.verify_password(user['password_hash'], password):
            return (json.dumps({'success': False, 'error': 'Invalid email or password'}), 401, headers)

        token = _make_token(email, user['is_admin'])
        return (json.dumps({
            'success': True,
            'token': token,
            'name': user['name'],
            'email': user['email'],
            'isAdmin': bool(user['is_admin'])
        }), 200, headers)
    except Exception as e:
        return (json.dumps({'success': False, 'error': str(e)}), 500, headers)
