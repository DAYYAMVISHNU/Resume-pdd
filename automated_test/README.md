Automated DAST test scaffolding.

Files:
- discover_endpoints.py: enumerate routes from backend/app.py
- runner.py: executes curl against discovered endpoints using input.json at workspace root

Create input.json with {"baseUrl":"http://localhost:5000","user":"<token>","admin":"<token>"}

