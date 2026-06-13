"""
Discover API endpoints by parsing Flask app source files.

Outputs a JSON file `discovered_endpoints.json` in this directory with entries:
  {path, methods, function, requires_auth (none/token/admin)}

This script reads `../backend/app.py` relative to the workspace root.
"""
import re
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP_PY = ROOT / 'backend' / 'app.py'

if not APP_PY.exists():
    print(f"Could not find backend app at: {APP_PY}")
    raise SystemExit(1)

text = APP_PY.read_text(encoding='utf-8')

# Find all @app.route occurrences and capture the route and methods
route_pattern = re.compile(r"@app\.route\(([^)]+)\)\s*\n(.*?)\ndef\s+(\w+)\(", re.S)
matches = route_pattern.findall(text)

endpoints = []
for raw_args, decorators_block, funcname in matches:
    # raw_args contains the string inside @app.route(...)
    # Extract path and methods
    path_match = re.search(r"['\"]([^'\"]+)['\"]", raw_args)
    methods_match = re.search(r"methods\s*=\s*\[([^\]]+)\]", raw_args)
    if path_match:
        path = path_match.group(1)
    else:
        path = ""

    if methods_match:
        methods_raw = methods_match.group(1)
        methods = [m.strip().strip('\"\'') for m in methods_raw.split(',')]
    else:
        methods = ['GET']

    # Determine auth requirements by looking at decorators above def
    # Check the decorators_block for token_required and admin_required
    requires = 'none'
    if '@admin_required' in decorators_block:
        requires = 'admin'
    elif '@token_required' in decorators_block:
        requires = 'token'

    endpoints.append({
        'path': path,
        'methods': methods,
        'function': funcname,
        'requires': requires
    })

# Filter out health/metrics/actuator endpoints
filtered = [e for e in endpoints if not any(skip in e['path'].lower() for skip in ['/health', '/actuator', '/metrics'])]

OUT = Path(__file__).parent / 'discovered_endpoints.json'
OUT.write_text(json.dumps({'count': len(filtered), 'endpoints': filtered}, indent=2))

print(f"Discovered {len(filtered)} endpoints (written to {OUT})")
for e in filtered:
    print(f"- {e['methods']} {e['path']} (func: {e['function']}) requires={e['requires']}")

print('\nPAUSE: review the list above. If you want me to proceed with tests, reply with: run-tests')

