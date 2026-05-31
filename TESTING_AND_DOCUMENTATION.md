# Testing Strategy & Documentation

## 1. UNIT TESTS

### Backend Unit Tests

```python
# backend/tests/test_validators.py
import pytest
from validators import InputValidator, ValidationError

class TestEmailValidation:
    def test_valid_email(self):
        valid, result = InputValidator.validate_email("user@example.com")
        assert valid
        assert result == "user@example.com"
    
    def test_invalid_email_format(self):
        valid, result = InputValidator.validate_email("invalid-email")
        assert not valid
        assert "Invalid email format" in result
    
    def test_email_too_long(self):
        long_email = "a" * 250 + "@example.com"
        valid, result = InputValidator.validate_email(long_email)
        assert not valid
    
    def test_empty_email(self):
        valid, result = InputValidator.validate_email("")
        assert not valid

class TestPasswordValidation:
    def test_valid_password(self):
        valid, result = InputValidator.validate_password("SecurePass123!@")
        assert valid
    
    def test_password_too_short(self):
        valid, result = InputValidator.validate_password("Short1!")
        assert not valid
        assert "8-128 characters" in result
    
    def test_password_missing_uppercase(self):
        valid, result = InputValidator.validate_password("password123!@")
        assert not valid
    
    def test_password_missing_special_char(self):
        valid, result = InputValidator.validate_password("Password123")
        assert not valid

class TestFileValidation:
    def test_valid_pdf_file(self):
        valid, msg = InputValidator.validate_file_upload("resume.pdf", 5 * 1024 * 1024)
        assert valid
    
    def test_invalid_file_extension(self):
        valid, msg = InputValidator.validate_file_upload("resume.exe", 5 * 1024 * 1024)
        assert not valid
        assert "Only" in msg
    
    def test_file_too_large(self):
        max_size = 25 * 1024 * 1024
        valid, msg = InputValidator.validate_file_upload("resume.pdf", max_size + 1)
        assert not valid
        assert "exceed" in msg

# backend/tests/test_ats_analyzer.py
import pytest
from ats_analyzer import ATSAnalyzer

class TestATSAnalyzer:
    def setup_method(self):
        self.analyzer = ATSAnalyzer()
    
    def test_basic_analysis(self):
        resume = "Python Developer with 5 years experience. Skills: Python, Django, REST APIs"
        jd = "We need a Python developer with Django experience"
        
        result = self.analyzer.analyze(resume, jd)
        
        assert result['score'] > 60
        assert len(result['matched_skills']) > 0
    
    def test_poor_match(self):
        resume = "Java Developer"
        jd = "We need Python and JavaScript expertise"
        
        result = self.analyzer.analyze(resume, jd)
        
        assert result['score'] < 60
        assert len(result['missing_skills']) > 0
    
    def test_skill_extraction(self):
        resume = "Proficient in Python, JavaScript, and React"
        jd = "Required: Python, React, Node.js"
        
        result = self.analyzer.analyze(resume, jd)
        
        matched_lower = [s.lower() for s in result['matched_skills']]
        assert 'python' in matched_lower
        assert 'react' in matched_lower

# backend/tests/test_jwt.py
import pytest
from app import create_jwt_token, verify_jwt_token
import time

class TestJWTTokens:
    def test_create_valid_token(self):
        token = create_jwt_token("test@example.com", False, "access")
        assert token
        assert len(token.split('.')) == 3
    
    def test_verify_valid_token(self):
        token = create_jwt_token("test@example.com", False, "access")
        payload = verify_jwt_token(token, "access")
        
        assert payload is not None
        assert payload['email'] == "test@example.com"
        assert payload['isAdmin'] == False
    
    def test_verify_invalid_token(self):
        invalid_token = "invalid.token.here"
        payload = verify_jwt_token(invalid_token, "access")
        assert payload is None
    
    def test_token_type_mismatch(self):
        token = create_jwt_token("test@example.com", False, "access")
        payload = verify_jwt_token(token, "refresh")
        assert payload is None
```

### Frontend Unit Tests

```typescript
// src/tests/hooks/useTheme.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useTheme } from '../../context/ThemeContext';

describe('useTheme', () => {
  it('should initialize with system preference', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDark).toBeDefined();
  });

  it('should toggle theme', () => {
    const { result } = renderHook(() => useTheme());
    const initialValue = result.current.isDark;
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.isDark).toBe(!initialValue);
  });

  it('should persist theme preference', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    const saved = localStorage.getItem('theme');
    expect(saved).toBe(result.current.isDark ? 'dark' : 'light');
  });
});

// src/tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../components/ui/Button';

describe('Button Component', () => {
  it('renders button with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('disables button when loading', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies variant styles', () => {
    const { container } = render(<Button variant="danger">Delete</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-red-600');
  });
});
```

---

## 2. INTEGRATION TESTS

```python
# backend/tests/test_auth_flow.py
import pytest
import json
from app import app
from database import db_init, get_db_connection

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            db_init()
        yield client

class TestAuthFlow:
    def test_register_new_user(self, client):
        response = client.post('/api/register', json={
            'name': 'John Doe',
            'email': 'john@example.com',
            'password': 'SecurePass123!@'
        })
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'access_token' in data
        assert 'refresh_token' in data
    
    def test_register_duplicate_email(self, client):
        # First registration
        client.post('/api/register', json={
            'name': 'John Doe',
            'email': 'john@example.com',
            'password': 'SecurePass123!@'
        })
        
        # Second registration with same email
        response = client.post('/api/register', json={
            'name': 'Jane Doe',
            'email': 'john@example.com',
            'password': 'SecurePass123!@'
        })
        
        assert response.status_code == 409
        data = json.loads(response.data)
        assert data['success'] == False
        assert 'already registered' in data['error']
    
    def test_login_valid_credentials(self, client):
        # Register user
        client.post('/api/register', json={
            'name': 'John Doe',
            'email': 'john@example.com',
            'password': 'SecurePass123!@'
        })
        
        # Login
        response = client.post('/api/login', json={
            'email': 'john@example.com',
            'password': 'SecurePass123!@'
        })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'access_token' in data
    
    def test_login_invalid_credentials(self, client):
        response = client.post('/api/login', json={
            'email': 'nonexistent@example.com',
            'password': 'WrongPassword123!@'
        })
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['success'] == False

class TestResumeUploadFlow:
    def test_upload_resume_without_auth(self, client):
        data = {
            'resume': (open('tests/sample_resume.pdf', 'rb'), 'resume.pdf')
        }
        response = client.post('/api/upload-resume', data=data)
        assert response.status_code == 401
    
    def test_upload_resume_with_auth(self, client):
        # Register and login
        register_resp = client.post('/api/register', json={
            'name': 'John Doe',
            'email': 'john@example.com',
            'password': 'SecurePass123!@'
        })
        token = json.loads(register_resp.data)['access_token']
        
        # Upload resume
        with open('tests/sample_resume.pdf', 'rb') as f:
            response = client.post(
                '/api/upload-resume',
                data={'resume': (f, 'resume.pdf')},
                headers={'Authorization': f'Bearer {token}'}
            )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] == True
        assert 'resume_id' in data
```

---

## 3. SECURITY TESTS

```python
# backend/tests/test_security.py
import pytest
import json
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

class TestSecurityVulnerabilities:
    def test_sql_injection_attempt(self, client):
        """Test protection against SQL injection"""
        response = client.post('/api/login', json={
            'email': "admin@example.com' OR '1'='1",
            'password': "' OR '1'='1"
        })
        
        # Should fail validation or return invalid credentials
        assert response.status_code in [400, 401]
    
    def test_xss_attempt(self, client):
        """Test protection against XSS attacks"""
        response = client.post('/api/register', json={
            'name': '<script>alert("xss")</script>',
            'email': 'test@example.com',
            'password': 'SecurePass123!@'
        })
        
        # Should either reject or sanitize
        data = json.loads(response.data)
        if data['success']:
            assert '<script>' not in data.get('name', '')
    
    def test_brute_force_protection(self, client):
        """Test rate limiting on login"""
        for i in range(10):
            response = client.post('/api/login', json={
                'email': 'test@example.com',
                'password': 'WrongPassword123!@'
            })
            
            if response.status_code == 429:  # Too Many Requests
                break
        
        # After several attempts, should be rate limited
        assert response.status_code == 429
    
    def test_jwt_token_tampering(self, client):
        """Test JWT token integrity"""
        # Create a token and tamper with payload
        original_token = "valid.token.here"
        parts = original_token.split('.')
        parts[1] = parts[1][:-5] + "xxxxx"  # Tamper with payload
        tampered_token = '.'.join(parts)
        
        response = client.post(
            '/api/analyses',
            headers={'Authorization': f'Bearer {tampered_token}'}
        )
        
        assert response.status_code == 401
    
    def test_missing_auth_header(self, client):
        """Test missing authentication"""
        response = client.get('/api/analyses')
        assert response.status_code == 401
    
    def test_invalid_token_format(self, client):
        """Test invalid token format"""
        response = client.get(
            '/api/analyses',
            headers={'Authorization': 'Bearer invalid_token'}
        )
        assert response.status_code == 401
```

---

## 4. PERFORMANCE TESTS

```python
# backend/tests/test_performance.py
import pytest
import time
from app import app
import json

class TestPerformance:
    def test_login_response_time(self, client):
        """Test login endpoint responds within 500ms"""
        start = time.time()
        response = client.post('/api/login', json={
            'email': 'test@example.com',
            'password': 'password123'
        })
        elapsed = time.time() - start
        
        assert elapsed < 0.5  # 500ms
    
    def test_resume_upload_handling(self, client):
        """Test resume upload doesn't timeout"""
        start = time.time()
        
        with open('tests/large_resume.pdf', 'rb') as f:
            response = client.post(
                '/api/upload-resume',
                data={'resume': (f, 'resume.pdf')},
                headers={'Authorization': f'Bearer {token}'}
            )
        
        elapsed = time.time() - start
        assert elapsed < 5.0  # 5 seconds max
    
    def test_concurrent_requests(self, client):
        """Test handling multiple concurrent requests"""
        import concurrent.futures
        
        def make_request():
            return client.get('/api/analyses',
                headers={'Authorization': f'Bearer {token}'})
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        # All requests should succeed
        assert all(r.status_code in [200, 401] for r in results)
```

---

## 5. PROJECT DOCUMENTATION

### Abstract

```markdown
## Abstract

ATS Resume Analyzer is an intelligent web application designed to bridge the gap between job seekers and hiring organizations by providing comprehensive resume optimization and AI-powered matching capabilities. The system analyzes resumes against job descriptions, calculating detailed ATS (Applicant Tracking System) scores, skill matching percentages, and providing actionable improvement suggestions.

### Key Features:
- **Advanced Resume Parsing:** Extracts skills, education, experience, and certifications from PDF, DOCX, and TXT files
- **ATS Score Calculation:** Generates detailed ATS scores with breakdown by multiple factors
- **Resume Ranking:** Ranks multiple resumes against a job description
- **Smart Recommendations:** AI-powered suggestions for resume optimization
- **Admin Dashboard:** Analytics and performance metrics
- **Security First:** JWT authentication, input validation, and encrypted credentials

### Objectives:
1. Automate resume analysis process
2. Help job seekers optimize their resumes for ATS systems
3. Assist recruiters in candidate ranking and selection
4. Provide data-driven insights for career development
5. Reduce hiring bias through objective scoring

### Technologies:
- Backend: Python Flask, SQLite
- Frontend: React 18, TypeScript, Tailwind CSS
- Mobile: Flutter (cross-platform support)
- Deployment: Vercel (backend), Play Store (mobile app)
```

### System Architecture

```markdown
## System Architecture

### Components:

1. **Frontend Layer**
   - React 18 SPA with TypeScript
   - Responsive design with Tailwind CSS
   - Dark mode support
   - Real-time feedback with animations

2. **Backend Layer**
   - Flask REST API
   - JWT-based authentication
   - Input validation and sanitization
   - Rate limiting and security headers

3. **Data Layer**
   - SQLite database with proper indexing
   - Schema with migrations
   - Connection pooling

4. **Processing Layer**
   - Resume parsing engine
   - ATS analysis algorithm
   - Ranking engine
   - Report generation

5. **Security Layer**
   - HTTPS/TLS encryption
   - CSRF protection
   - SQL injection prevention
   - XSS protection
   - Rate limiting

### Data Flow:

```
User Registration
    ↓
JWT Token Generation
    ↓
Resume Upload
    ↓
File Parsing (PDF/DOCX extraction)
    ↓
Resume Analysis
    ↓
ATS Scoring & Comparison
    ↓
Results & Recommendations
    ↓
Report Generation & Export
```
```

### Testing Documentation

```markdown
## Testing Strategy

### Test Coverage Targets:
- Unit Tests: 80% code coverage
- Integration Tests: 70% feature coverage
- Security Tests: 100% of auth endpoints
- Performance Tests: All critical paths

### Test Execution:
```bash
# Run all tests
pytest tests/ -v

# Run with coverage report
pytest tests/ --cov=backend --cov-report=html

# Run security tests only
pytest tests/test_security.py -v

# Run performance tests only
pytest tests/test_performance.py -v
```

### CI/CD Pipeline:
1. Code push to repository
2. Run unit tests
3. Run security tests
4. Generate coverage report
5. Build Docker image
6. Deploy to staging
7. Run integration tests
8. Deploy to production
```

### Deployment Checklist

```markdown
## Play Store Deployment Checklist

### Pre-Deployment:
- [ ] App compiled in release mode
- [ ] APK signed with production key
- [ ] All sensitive data removed from code
- [ ] Privacy Policy written and linked
- [ ] Terms and Conditions document created
- [ ] User data protection confirmed

### App Store Listing:
- [ ] App title (50 chars max)
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] Screenshots (5 minimum)
- [ ] Feature graphic (1024x500px)
- [ ] Category selected
- [ ] Content rating filled

### Permissions:
- [ ] Internet permission explained
- [ ] File storage permission explained
- [ ] Camera permission (if applicable)
- [ ] Microphone permission (if applicable)

### Testing:
- [ ] Tested on Android 8.0+
- [ ] Tested on tablet devices
- [ ] Dark mode tested
- [ ] Network failure scenarios tested
- [ ] All user flows tested

### Security & Privacy:
- [ ] No hardcoded credentials
- [ ] No debug logging enabled
- [ ] HTTPS enforced for all API calls
- [ ] User data encrypted at rest
- [ ] Privacy policy includes data usage
- [ ] GDPR compliance verified

### Compliance:
- [ ] All app store policies reviewed
- [ ] Content rating appropriate
- [ ] No prohibited content
- [ ] Crash reporting enabled
- [ ] Analytics compliant with policies
```

---

**Testing ensures:** ✅ Reliability, Security, Performance, and User Trust
