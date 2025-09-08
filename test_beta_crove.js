const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging
  page.on('console', msg => {
    console.log(`Browser console [${msg.type()}]:`, msg.text());
  });

  // Catch errors
  page.on('pageerror', error => {
    console.error('Page error:', error.message);
  });

  console.log('Navigating to https://beta.crove.com/...');
  
  try {
    await page.goto('https://beta.crove.com/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    console.log('Page loaded successfully');

    // Check if the app div is empty
    const appContent = await page.evaluate(() => {
      const appDiv = document.getElementById('app');
      return {
        exists: !!appDiv,
        innerHTML: appDiv ? appDiv.innerHTML : null,
        childCount: appDiv ? appDiv.children.length : 0
      };
    });

    console.log('App div status:', appContent);

    // Check for any JavaScript errors in window
    const jsErrors = await page.evaluate(() => {
      return window.chatwootConfig ? 'Config loaded' : 'Config missing';
    });
    console.log('Chatwoot config:', jsErrors);

    // Check if Vue is loaded
    const vueStatus = await page.evaluate(() => {
      return typeof window.Vue !== 'undefined' ? 'Vue loaded' : 'Vue not loaded';
    });
    console.log('Vue status:', vueStatus);

    // Take screenshot
    await page.screenshot({ path: 'beta_crove_screenshot.png', fullPage: true });
    console.log('Screenshot saved as beta_crove_screenshot.png');

    // Get page title
    const title = await page.title();
    console.log('Page title:', title);

    // Check for noscript message visibility
    const noscriptVisible = await page.evaluate(() => {
      const noscript = document.getElementById('noscript');
      return noscript ? noscript.textContent : null;
    });
    if (noscriptVisible) {
      console.log('Noscript message:', noscriptVisible);
    }

  } catch (error) {
    console.error('Error during test:', error);
  }

  await browser.close();
})();