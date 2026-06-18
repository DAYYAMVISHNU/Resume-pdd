#!/usr/bin/env python3
"""
ci_mock_server.py
-----------------
Lightweight single-file HTTP server used in CI to provide a real
/health endpoint for the load test without requiring a database or
any external dependencies.

Usage:
    python automated_test/ci_mock_server.py
"""

import http.server
import json
import time
import sys

class HealthHandler(http.server.BaseHTTPRequestHandler):
    """Handles GET requests for any path and returns HTTP 200 with a JSON body."""

    def do_GET(self):
        body = json.dumps({
            "status": "ok",
            "server": "ci-mock",
            "timestamp": time.time()
        }).encode()

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        # Suppress per-request logs during load test for cleaner CI output
        pass


def main():
    host = "127.0.0.1"
    port = 5000
    server = http.server.HTTPServer((host, port), HealthHandler)
    print(f"[ci_mock_server] Listening on http://{host}:{port}  (Ctrl-C to stop)", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[ci_mock_server] Shutting down.", flush=True)
        server.server_close()
        sys.exit(0)


if __name__ == "__main__":
    main()
