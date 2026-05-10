import sys
import os

# Add backend directory to Python path
backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, os.path.abspath(backend_dir))

from app import app

# Vercel expects a variable named 'handler' or 'app'
handler = app
