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
