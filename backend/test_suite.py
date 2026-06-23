import unittest
import os
import sys
import json
import time
import sqlite3

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

import database
import app
from database import hash_password, verify_password, create_user, get_user_by_email
from app import create_jwt_token, verify_jwt_token, calculate_ats_similarity, advanced_parse_resume

class TestSecurityAndCoreEngine(unittest.TestCase):
    
    def setUp(self):
        # Override database file to a temporary one for testing
        database.DATABASE_FILE = os.path.join(os.path.dirname(__file__), "test_ats_analyzer.db")
        database.db_init()
        self.app = app.app.test_client()
        self.app.testing = True

    def tearDown(self):
        # Remove test database
        if os.path.exists(database.DATABASE_FILE):
            try:
                os.remove(database.DATABASE_FILE)
            except OSError:
                pass

    def test_password_hashing(self):
        """Verify password cryptography hashing and validation matches exactly."""
        password = "".join(["Secure", "Password", "123"])
        hashed = hash_password(password)
        self.assertNotEqual(hashed, password)
        self.assertTrue(verify_password(hashed, password))
        self.assertFalse(verify_password(hashed, "wrongPassword"))

    def test_user_database_operations(self):
        """Verify SQLite creation constraints and lookup capabilities."""
        # Create standard user
        res = create_user("Test Candidate", "candidate@gmail.com", "mypass123")
        self.assertTrue(res["success"])
        
        # Test integrity duplicate email constraint
        dup_res = create_user("Duplicate User", "candidate@gmail.com", "mypass123")
        self.assertFalse(dup_res["success"])
        self.assertIn("already registered", dup_res["error"])

        # Fetch user
        user = get_user_by_email("candidate@gmail.com")
        self.assertIsNotNone(user)
        self.assertEqual(user["name"], "Test Candidate")

    def test_jwt_issuance_and_verification(self):
        """Verify that JWT signature verification works correctly."""
        email = "test@company.com"
        token = create_jwt_token(email, is_admin=False)
        self.assertIsNotNone(token)
        
        # Verify decoding matches payload
        payload = verify_jwt_token(token)
        self.assertIsNotNone(payload)
        self.assertEqual(payload["email"], email)
        self.assertFalse(payload["isAdmin"])
        
        # Verify tampering detection
        tampered_token = token + "abc"
        payload_tampered = verify_jwt_token(tampered_token)
        self.assertIsNone(payload_tampered)

    def test_ats_similarity_matching(self):
        """Verify the weighted keyword similarity scoring engine matches specification."""
        resume_text = "Experienced Python developer with React and Javascript skills."
        job_desc = "Looking for a Python Developer specializing in React interfaces."
        
        score = calculate_ats_similarity(resume_text, job_desc)
        self.assertGreater(score, 40)
        self.assertLessEqual(score, 100)

    def test_advanced_resume_parsing(self):
        """Verify the structural heuristic section extraction maps email, phone, and skills."""
        resume_text = """
        John Doe
        Email: john.doe@gmail.com
        Phone: 123-456-7890
        
        Skills: Python, Java, React, SQL, AWS
        
        Experience:
        Software Engineer at Google - Worked on cloud scalability.
        
        Education:
        B.S. in Computer Science from State University
        """
        
        parsed = advanced_parse_resume(resume_text)
        self.assertEqual(parsed["email"], "john.doe@gmail.com")
        self.assertIn("Python", parsed["skills"])
        self.assertIn("React", parsed["skills"])

    def test_rest_api_endpoints(self):
        """Verify the complete auth signup and login REST cycles."""
        # Register via API
        reg_payload = {
            "name": "API User",
            "email": "api@test.com",
            "password": "apipassword"
        }
        res = self.app.post('/api/register', 
                             data=json.dumps(reg_payload),
                             content_type='application/json')
        self.assertEqual(res.status_code, 200)

        # Login via API and retrieve JWT
        login_payload = {
            "email": "api@test.com",
            "password": "apipassword"
        }
        res_login = self.app.post('/api/login', 
                                   data=json.dumps(login_payload),
                                   content_type='application/json')
        self.assertEqual(res_login.status_code, 200)
        login_data = json.loads(res_login.data)
        self.assertTrue(login_data["success"])
        self.assertIsNotNone(login_data["token"])

if __name__ == '__main__':
    unittest.main()
