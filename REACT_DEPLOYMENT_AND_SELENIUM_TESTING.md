# React Deployment and Selenium E2E Testing Documentation

This document provides a comprehensive guide to deploying this React Vite project to GitHub Pages and configuring Selenium end-to-end (E2E) testing.

---

## Part 1: Deploying to GitHub Pages

### Step 1 — Push Your Project to GitHub
Initialize your git repository (if not already done) and push it to GitHub:

```bash
git init
git add .
git commit -m "Initial project upload"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```
*Note: Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repository name.*

---

### Step 2 — Install GitHub Pages Package
Run the following command inside the `frontend` folder to install the `gh-pages` deployment utility:

```bash
npm install gh-pages --save-dev
```

---

### Step 3 — Update package.json
Open `frontend/package.json` and update the properties:

1. Add the `"homepage"` key at the root level:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO",
   ```
2. Under the `"scripts"` object, add the predeploy and deploy commands. Since this is a Vite-based project, the production build output is compiled to the `dist` directory (not `build`):
   ```json
   "scripts": {
     "dev": "npx vite --host",
     "build": "npx vite build",
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

---

### Step 4 — Deploy React Project
Build and deploy your application to GitHub Pages by running this command inside the `frontend` directory:

```bash
npm run deploy
```
This command automatically:
- Triggers `predeploy` to compile the Vite production-ready assets to `/dist`.
- Publishes the content of `/dist` to a separate `gh-pages` branch on your GitHub repository.

---

### Step 5 — Enable GitHub Pages on GitHub
1. Navigate to your repository on GitHub.
2. Go to **Settings** → **Pages**.
3. Under **Build and deployment**:
   - Set **Source** to `Deploy from branch`.
   - Set **Branch** to `gh-pages` (usually root `/`).
4. Click **Save**.

---

### Step 6 — Access the Live Application
Your application will be live at:
`https://YOUR_USERNAME.github.io/YOUR_REPO/`

---

### Step 7 — Configure React Router for GitHub Pages
By default, standard browser history routing (`BrowserRouter`) fails on page refreshes or direct deep links on static hosts like GitHub Pages (returning `404 Page Not Found`). 

To resolve this, replace `BrowserRouter` with `HashRouter`:

In `frontend/src/App.tsx`:
```typescript
// Replace:
import { BrowserRouter as Router } from 'react-router-dom';

// With:
import { HashRouter as Router } from 'react-router-dom';
```
This forces URLs to use hash routing (e.g., `https://USERNAME.github.io/REPO/#/login`), ensuring the server always redirects incoming requests to `index.html` where React Router can take over.

---

### Step 8 — Rebuild and Redeploy
Whenever you make routing or component changes:

```bash
npm run build
npm run deploy
```

---

### Step 9 — Verify Deployment
Verify your live site at `https://USERNAME.github.io/REPO/#/login` to ensure:
- The landing page displays successfully.
- Login screen loads correctly.
- Refreshing the page does not throw a 404 error.

---

## Part 2: Selenium E2E Automation Testing

### Step 10 — Setup Test Structure
We separate the automation testing framework from the main frontend dependencies. Create a `selenium-tests` folder inside the `frontend` directory:

```
frontend/
└── selenium-tests/
    ├── package.json
    └── tests/
        └── login.test.js
```

Install `selenium-webdriver` and `mocha` inside `frontend/selenium-tests`:

```bash
cd frontend/selenium-tests
npm init -y
npm install selenium-webdriver mocha --save-dev
```

---

### Step 11 — Add Stable IDs for Automation
To make E2E scripts robust, add unique `id` attributes to input fields and interactive buttons so Selenium can locate them reliably.

For example, in `frontend/src/screens/auth/LoginScreen.tsx`:
```html
<input id="email" type="email" ... />
<input id="password" type="password" ... />
<Button id="login-button" type="submit" ... />
```

---

### Step 12 — Create the E2E Login Test
Write the Selenium test script in `frontend/selenium-tests/tests/login.test.js`:

```javascript
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require('assert');

describe('Login E2E Flow', function () {
  this.timeout(30000); // 30-second timeout
  let driver;

  before(async function () {
    let options = new chrome.Options();
    // Use headless mode in CI environments
    if (process.env.CI) {
      options.addArguments('--headless');
      options.addArguments('--no-sandbox');
      options.addArguments('--disable-dev-shm-usage');
    }
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('should log in successfully and redirect to home dashboard', async function () {
    // Navigate to local dev site (or live URL)
    const baseUrl = process.env.TEST_URL || 'http://localhost:5173';
    await driver.get(`${baseUrl}/#/login`);

    // Wait until email input is loaded
    const emailInput = await driver.wait(
      until.elementLocated(By.id('email')),
      10000
    );

    // Populate credentials
    await emailInput.sendKeys('test@example.com');
    await driver.findElement(By.id('password')).sendKeys('SecurePass123!@');

    // Click Sign In
    const loginBtn = await driver.findElement(By.id('login-button'));
    await loginBtn.click();

    // Verify dashboard redirect URL
    await driver.wait(until.urlContains('/#/home'), 15000);
    const currentUrl = await driver.getCurrentUrl();
    assert.ok(currentUrl.includes('/#/home'), `Redirected URL is ${currentUrl}`);
  });
});
```

---

### Step 13 — Run Selenium Test Locally
1. Start your local frontend dev server and backend API:
   ```bash
   npm run start
   ```
2. Navigate to `frontend/selenium-tests/` and run the tests:
   ```bash
   npm run login
   ```

---

## Part 3: GitHub Actions CI/CD Pipeline

### Step 14 — Setup GitHub Actions Workflow
Create a workflow configuration file at `.github/workflows/selenium-login.yml` to run the E2E tests automatically on code updates:

```yaml
name: Selenium E2E and CI/CD Build

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      # Optional: Spin up a database or backend mock if needed
      # (Alternatively run Flask backend locally on runner)

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install Frontend Dependencies
        run: |
          cd frontend
          npm ci

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install Backend Dependencies
        run: |
          python -m pip install --upgrade pip
          if [ -f backend/requirements.txt ]; then pip install -r backend/requirements.txt; fi

      - name: Start Backend API
        run: |
          python backend/app.py &
        env:
          PORT: 5000
          ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
          JWT_SECRET_KEY: ${{ secrets.JWT_SECRET_KEY }}

      - name: Start Frontend Server
        run: |
          cd frontend
          npm run dev -- --port 5173 &

      - name: Install Chrome and Driver
        run: |
          sudo apt-get update
          sudo apt-get install -y google-chrome-stable

      - name: Install Selenium Test Dependencies
        run: |
          cd frontend/selenium-tests
          npm ci

      - name: Run E2E Selenium Tests
        run: |
          cd frontend/selenium-tests
          npm run login
        env:
          CI: true
          TEST_URL: http://localhost:5173

      - name: Build Frontend Application
        run: |
          cd frontend
          npm run build
```

### Step 15 — Automated Pipeline Verification
Whenever a developer performs a `git push`:
1. GitHub Actions triggers the workspace.
2. Checks out code and provisions a headless Chrome context.
3. Spins up local environments for testing.
4. Executes the Selenium tests, validating login functions and redirection.
5. Blocks deployments if tests fail, providing immediate pass/fail reports on pull requests.
