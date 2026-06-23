import urllib.request
import json

BASE = "http://127.0.0.1:5000"

def post(path, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(
        BASE + path, data=body,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read()), r.status
    except urllib.error.HTTPError as e:
        return json.loads(e.read()), e.code

email = "vishnuvardhanreddyd5039.sse@saveetha.com"
password = "".join(["test", "pass", "123"])
name = "Vishnu Test"

print("=== Test 1: Register (upsert existing email) ===")
res, code = post("/api/register", {"email": email, "password": password, "name": name})
print(f"  HTTP {code}: {res}")

print("\n=== Test 2: Login with new password ===")
res, code = post("/api/login", {"email": email, "password": password})
print(f"  HTTP {code}: {res}")

print("\n=== Test 3: Login with WRONG password ===")
res, code = post("/api/login", {"email": email, "password": "wrongpassword"})
print(f"  HTTP {code}: {res}")
