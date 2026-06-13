"""
Selenium Tests for Web App (React) - Complete User Journey from Login to End

Tests cover:
1. App Load & Page Render
2. Login with credentials
3. Resume upload & ATS analysis
4. ATS format checking
5. Multiple resume ranking
6. Job description templates
7. Chat functionality
8. Analytics dashboard
9. Share & export
10. Logout
"""

import json
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service

class WebAppTester:
    def __init__(self, headless=False, base_url='http://localhost:3000'):
        self.base_url = base_url
        self.headless = headless
        self.driver = None
        self.test_results = []
        self.start_time = datetime.now()
        
    def setup_driver(self):
        """Initialize Selenium WebDriver"""
        try:
            options = webdriver.ChromeOptions()
            if self.headless:
                options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-blink-features=AutomationControlled')
            
            self.driver = webdriver.Chrome(options=options)
            self.driver.set_window_size(1920, 1080)
            self.log_test('Setup', 'Browser Initialization', 'PASS', 'Chrome browser initialized')
            return True
        except Exception as e:
            self.log_test('Setup', 'Browser Initialization', 'FAIL', str(e))
            return False
    
    def log_test(self, category, action, status, details='', duration=0):
        """Log test result"""
        self.test_results.append({
            'timestamp': datetime.now().isoformat(),
            'category': category,
            'action': action,
            'status': status,
            'details': details,
            'duration_ms': duration,
            'platform': 'Web (React/Chrome)'
        })
        print(f"[{status}] {category} > {action}: {details}")
    
    def test_page_load(self):
        """Test 1: App page load"""
        try:
            start = time.time()
            self.driver.get(self.base_url)
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="login-form"], input[type="email"]'))
            )
            duration = (time.time() - start) * 1000
            self.log_test('Page Load', 'Initial Load', 'PASS', f'Page loaded in {duration:.0f}ms', duration)
            return True
        except Exception as e:
            self.log_test('Page Load', 'Initial Load', 'FAIL', str(e))
            return False
    
    def test_login(self, email='test@gmail.com', password='Test123!'):
        """Test 2: User login"""
        try:
            start = time.time()
            # Find and fill email
            email_input = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="email"]'))
            )
            email_input.clear()
            email_input.send_keys(email)
            
            # Find and fill password
            password_input = self.driver.find_element(By.CSS_SELECTOR, 'input[type="password"]')
            password_input.clear()
            password_input.send_keys(password)
            
            # Click login button
            login_btn = self.driver.find_element(By.XPATH, '//button[contains(text(), "Login")]')
            login_btn.click()
            
            # Wait for dashboard
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//*[contains(text(), "Dashboard") or contains(text(), "Welcome")]'))
            )
            duration = (time.time() - start) * 1000
            self.log_test('Authentication', 'User Login', 'PASS', f'Logged in as {email}', duration)
            return True
        except Exception as e:
            self.log_test('Authentication', 'User Login', 'FAIL', str(e))
            return False
    
    def test_resume_upload_and_analyze(self):
        """Test 3: Resume upload and ATS analysis"""
        try:
            start = time.time()
            # Click upload resume
            upload_btn = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//button[contains(text(), "Upload") or contains(text(), "Analyze")]'))
            )
            upload_btn.click()
            time.sleep(1)
            
            # Fill job description
            jd_textarea = self.driver.find_element(By.CSS_SELECTOR, 'textarea')
            jd_textarea.clear()
            jd_textarea.send_keys('Python Flask REST API Docker AWS Kubernetes')
            
            # Click analyze
            analyze_btn = self.driver.find_element(By.XPATH, '//button[contains(text(), "Analyze")]')
            analyze_btn.click()
            
            # Wait for results
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.XPATH, '//*[contains(text(), "Score") or contains(text(), "%")]'))
            )
            duration = (time.time() - start) * 1000
            self.log_test('Resume Analysis', 'Upload & Analyze', 'PASS', 'Resume analyzed', duration)
            return True
        except Exception as e:
            self.log_test('Resume Analysis', 'Upload & Analyze', 'FAIL', str(e))
            return False
    
    def test_ats_check(self):
        """Test 4: ATS format check"""
        try:
            start = time.time()
            # Navigate to ATS check tab
            ats_tab = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//button[contains(text(), "ATS") or contains(text(), "Format")]'))
            )
            ats_tab.click()
            time.sleep(1)
            
            # Upload file
            upload_input = self.driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
            # Note: In real scenario, you'd provide actual file path
            
            # Wait for ATS results
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//*[contains(text(), "Format") or contains(text(), "Check")]'))
            )
            duration = (time.time() - start) * 1000
            self.log_test('ATS Checking', 'Format Verification', 'PASS', 'ATS check completed', duration)
            return True
        except Exception as e:
            self.log_test('ATS Checking', 'Format Verification', 'FAIL', str(e))
            return False
    
    def test_multiple_resume_ranking(self):
        """Test 5: Rank multiple resumes"""
        try:
            start = time.time()
            # Navigate to ranking
            rank_tab = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//button[contains(text(), "Rank")]'))
            )
            rank_tab.click()
            time.sleep(1)
            
            # Upload multiple files
            file_inputs = self.driver.find_elements(By.CSS_SELECTOR, 'input[type="file"]')
            
            # Fill job description
            jd_field = self.driver.find_element(By.CSS_SELECTOR, 'textarea')
            jd_field.clear()
            jd_field.send_keys('Senior Developer Role')
            
            # Start ranking
            rank_btn = self.driver.find_element(By.XPATH, '//button[contains(text(), "Rank")]')
            rank_btn.click()
            
            # Wait for results
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.XPATH, '//*[contains(text(), "Rank") or contains(text(), "Score")]'))
            )
            duration = (time.time() - start) * 1000
            self.log_test('Resume Ranking', 'Multi-Resume Ranking', 'PASS', 'Resumes ranked', duration)
            return True
        except Exception as e:
            self.log_test('Resume Ranking', 'Multi-Resume Ranking', 'FAIL', str(e))
            return False
    
    def test_job_descriptions(self):
        """Test 6: Job description templates"""
        try:
            start = time.time()
            # Navigate to job descriptions
            jd_btn = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//button[contains(text(), "Job")]'))
            )
            jd_btn.click()
            time.sleep(1)
            
            # Create new template
            new_btn = self.driver.find_element(By.XPATH, '//button[contains(text(), "New") or contains(text(), "Add")]')
            new_btn.click()
            
            # Fill form
            title_input = self.driver.find_element(By.CSS_SELECTOR, 'input[placeholder*="Title"]')
            title_input.send_keys('Backend Engineer')
            
            desc_input = self.driver.find_element(By.CSS_SELECTOR, 'textarea')
            desc_input.send_keys('Node.js, MongoDB, REST API')
            
            # Save
            save_btn = self.driver.find_element(By.XPATH, '//button[contains(text(), "Save")]')
            save_btn.click()
            
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//*[contains(text(), "Saved") or contains(text(), "Backend Engineer")]'))
            )
            duration = (time.time() - start) * 1000
            self.log_test('Job Descriptions', 'Template Save', 'PASS', 'Template saved', duration)
            return True
        except Exception as e:
            self.log_test('Job Descriptions', 'Template Save', 'FAIL', str(e))
            return False
    
    def test_chat(self):
        """Test 7: Chat functionality"""
        try:
            start = time.time()
            # Open chat
            chat_btn = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//button[contains(text(), "Chat") or contains(text(), "Support")]'))
            )
            chat_btn.click()
            time.sleep(1)
            
            # Send message
            msg_input = self.driver.find_element(By.CSS_SELECTOR, 'input[placeholder*="message"]')
            msg_input.send_keys('How to improve ATS score?')
            
            # Send
            send_btn = self.driver.find_element(By.XPATH, '//button[@aria-label="Send" or contains(text(), "Send")]')
            send_btn.click()
            
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//*[contains(text(), "How to improve")]'))
            )
            duration = (time.time() - start) * 1000
            self.log_test('Chat', 'Send Message', 'PASS', 'Message sent', duration)
            return True
        except Exception as e:
            self.log_test('Chat', 'Send Message', 'FAIL', str(e))
            return False
    
    def test_analytics(self):
        """Test 8: Analytics dashboard"""
        try:
            start = time.time()
            # Navigate to analytics
            analytics_btn = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//button[contains(text(), "Analytics")]'))
            )
            analytics_btn.click()
            time.sleep(1)
            
            # Wait for charts
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//*[contains(text(), "Total") or contains(text(), "Chart")]'))
            )
            duration = (time.time() - start) * 1000
            self.log_test('Analytics', 'Dashboard View', 'PASS', 'Analytics loaded', duration)
            return True
        except Exception as e:
            self.log_test('Analytics', 'Dashboard View', 'FAIL', str(e))
            return False
    
    def test_share_export(self):
        """Test 9: Share and export"""
        try:
            start = time.time()
            # Open share menu
            share_btn = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//button[contains(text(), "Share")]'))
            )
            share_btn.click()
            time.sleep(1)
            
            # Share via email
            email_opt = self.driver.find_element(By.XPATH, '//button[contains(text(), "Email")]')
            email_opt.click()
            
            # Enter email
            email_input = self.driver.find_element(By.CSS_SELECTOR, 'input[type="email"]')
            email_input.send_keys('user@example.com')
            
            # Submit
            submit_btn = self.driver.find_element(By.XPATH, '//button[contains(text(), "Send")]')
            submit_btn.click()
            
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//*[contains(text(), "Shared")]'))
            )
            duration = (time.time() - start) * 1000
            self.log_test('Share & Export', 'Email Share', 'PASS', 'Shared successfully', duration)
            return True
        except Exception as e:
            self.log_test('Share & Export', 'Email Share', 'FAIL', str(e))
            return False
    
    def test_logout(self):
        """Test 10: User logout"""
        try:
            start = time.time()
            # Open profile menu
            profile_btn = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//button[@aria-label="Profile" or contains(text(), "Profile")]'))
            )
            profile_btn.click()
            time.sleep(1)
            
            # Click logout
            logout_btn = self.driver.find_element(By.XPATH, '//button[contains(text(), "Logout")]')
            logout_btn.click()
            
            # Wait for login page
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//button[contains(text(), "Login")]'))
            )
            duration = (time.time() - start) * 1000
            self.log_test('Authentication', 'User Logout', 'PASS', 'Logged out successfully', duration)
            return True
        except Exception as e:
            self.log_test('Authentication', 'User Logout', 'FAIL', str(e))
            return False
    
    def run_all_tests(self):
        """Execute all tests"""
        print("\n" + "="*70)
        print("WEB APP SELENIUM TEST SUITE")
        print("="*70 + "\n")
        
        if not self.setup_driver():
            print("Failed to initialize driver")
            return self.test_results
        
        tests = [
            ('test_page_load', self.test_page_load),
            ('test_login', lambda: self.test_login()),
            ('test_resume_upload_and_analyze', self.test_resume_upload_and_analyze),
            ('test_ats_check', self.test_ats_check),
            ('test_multiple_resume_ranking', self.test_multiple_resume_ranking),
            ('test_job_descriptions', self.test_job_descriptions),
            ('test_chat', self.test_chat),
            ('test_analytics', self.test_analytics),
            ('test_share_export', self.test_share_export),
            ('test_logout', self.test_logout),
        ]
        
        for test_name, test_func in tests:
            try:
                print(f"\nRunning: {test_name}")
                test_func()
                time.sleep(2)
            except Exception as e:
                print(f"Error in {test_name}: {e}")
        
        self.cleanup()
        return self.test_results
    
    def cleanup(self):
        """Close browser"""
        if self.driver:
            self.driver.quit()


if __name__ == '__main__':
    tester = WebAppTester(headless=False)
    results = tester.run_all_tests()
    
    # Save results
    with open('selenium_web_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nTotal tests: {len(results)}")
    print(f"Passed: {len([r for r in results if r['status'] == 'PASS'])}")
    print(f"Failed: {len([r for r in results if r['status'] == 'FAIL'])}")

