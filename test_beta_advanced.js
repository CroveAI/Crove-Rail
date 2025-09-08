const { chromium } = require('playwright');

(async () => {
  console.log('Starting Playwright test for beta.crove.com...\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();

  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log(`❌ Page Error: ${error.message}`);
  });

  // Capture network failures
  page.on('requestfailed', request => {
    console.log(`❌ Request Failed: ${request.url()} - ${request.failure().errorText}`);
  });

  try {
    console.log('📍 Navigating to https://beta.crove.com/...');
    const response = await page.goto('https://beta.crove.com/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    console.log(`✅ Page loaded with status: ${response.status()}`);

    // Wait a bit for JavaScript to execute
    await page.waitForTimeout(3000);

    // Check page title
    const title = await page.title();
    console.log(`📄 Page title: "${title}"`);

    // Check if app is rendered
    const appContent = await page.evaluate(() => {
      const appDiv = document.getElementById('app');
      if (!appDiv) return { error: 'No app div found' };
      
      return {
        hasContent: appDiv.innerHTML.length > 0,
        childCount: appDiv.children.length,
        firstChildTag: appDiv.firstElementChild?.tagName,
        visibleText: appDiv.innerText?.substring(0, 100)
      };
    });

    console.log('\n🔍 App Status:');
    console.log(`   - Has content: ${appContent.hasContent}`);
    console.log(`   - Child elements: ${appContent.childCount}`);
    console.log(`   - First element: ${appContent.firstChildTag}`);
    if (appContent.visibleText) {
      console.log(`   - Visible text: "${appContent.visibleText}..."`);
    }

    // Check if it's showing login page
    const isLoginPage = await page.evaluate(() => {
      return document.body.innerText.includes('Login to Chatwoot');
    });

    if (isLoginPage) {
      console.log('\n✅ App is working! Currently showing login page.');
      
      // Check for login form elements
      const hasLoginForm = await page.evaluate(() => {
        return {
          emailField: !!document.querySelector('input[type="text"][placeholder*="example"]'),
          passwordField: !!document.querySelector('input[type="password"]'),
          submitButton: !!document.querySelector('button[type="submit"]')
        };
      });
      
      console.log('\n📝 Login form elements:');
      console.log(`   - Email field: ${hasLoginForm.emailField ? '✅' : '❌'}`);
      console.log(`   - Password field: ${hasLoginForm.passwordField ? '✅' : '❌'}`);
      console.log(`   - Submit button: ${hasLoginForm.submitButton ? '✅' : '❌'}`);
    }

    // Check JavaScript configuration
    const jsConfig = await page.evaluate(() => {
      return {
        chatwootConfig: typeof window.chatwootConfig !== 'undefined',
        globalConfig: typeof window.globalConfig !== 'undefined',
        vueApp: typeof window.Vue !== 'undefined' || !!document.querySelector('#app').__vue_app__
      };
    });

    console.log('\n⚙️ JavaScript Configuration:');
    console.log(`   - Chatwoot config: ${jsConfig.chatwootConfig ? '✅' : '❌'}`);
    console.log(`   - Global config: ${jsConfig.globalConfig ? '✅' : '❌'}`);
    console.log(`   - Vue app: ${jsConfig.vueApp ? '✅ Mounted' : '⚠️ Not detected'}`);

    // Take screenshot
    await page.screenshot({ 
      path: 'beta_crove_test.png', 
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved as beta_crove_test.png');

    console.log('\n✨ Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();