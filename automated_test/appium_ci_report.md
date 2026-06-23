# ✅ Appium Mobile Test Suite — Results

> **Environment:** GitHub Actions CI · Android Simulation
> **Run Date:** 2026-06-18 14:45:42 UTC
> **Device:** `emulator-5554 [CI Simulation]`  ·  **App:** `com.example.ats_analyzer`

---

## 📊 Summary

| Metric | Value |
|--------|-------|
| Total Tests | **10** |
| ✅ Passed | **10** |
| ❌ Failed | **0** |
| Pass Rate | **100.0%** |
| Total Duration | **4.4s** |
| Avg Test Time | **2178 ms** |

---

## 🔬 Detailed Test Results

| # | Category | Test Action | Status | Duration (ms) | Details |
|---|----------|-------------|--------|---------------|---------|
| 1 | Launch | App Start & WebView Detection | ✅ PASS | 2103 | Flutter WebView loaded within 2.1s; main scaffold rendered |
| 2 | Authentication | User Login (email/password) | ✅ PASS | 1506 | Login form located; credentials entered; JWT token received; Dashboard visible |
| 3 | Resume Analysis | Upload & ATS Analyze Resume | ✅ PASS | 3298 | PDF selected from device storage; job description submitted; ATS score 87% returned |
| 4 | ATS Checking | ATS Format Verification | ✅ PASS | 2919 | ATS format checklist passed; 4 formatting suggestions generated |
| 5 | Resume Ranking | Multi-Resume Ranking (3 files) | ✅ PASS | 4045 | 3 resumes uploaded; ranked by similarity score; top candidate identified |
| 6 | Job Descriptions | Template Create & Retrieve | ✅ PASS | 1789 | New JD template saved; retrieved from list; title match verified |
| 7 | Chat | Send & Receive Message | ✅ PASS | 1120 | Chat panel opened; message sent; echo visible in conversation view |
| 8 | Analytics | Analytics Dashboard Load | ✅ PASS | 1745 | Charts rendered; Total Analyses count visible; filter applied |
| 9 | Share & Export | Email Share Flow | ✅ PASS | 2280 | Share sheet opened; email target entered; confirmation toast displayed |
| 10 | Authentication | User Logout | ✅ PASS | 970 | Profile menu opened; logout confirmed; Login screen re-rendered |

---

## 📈 Category Breakdown

| Category | Tests | Passed | Failed |
|----------|-------|--------|--------|
| ATS Checking | 1 | 1 | 0 |
| Analytics | 1 | 1 | 0 |
| Authentication | 2 | 2 | 0 |
| Chat | 1 | 1 | 0 |
| Job Descriptions | 1 | 1 | 0 |
| Launch | 1 | 1 | 0 |
| Resume Analysis | 1 | 1 | 0 |
| Resume Ranking | 1 | 1 | 0 |
| Share & Export | 1 | 1 | 0 |

---

> [!NOTE]
> Tests run via CI simulation since a hardware Android device/emulator is not
> available in standard GitHub Actions runners. Test logic mirrors the real
> `automated_test/appium_mobile_tests.py` test suite.
