const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', error => console.log('ERROR:', error.message));
  
  await page.goto('http://localhost:5174/');
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await browser.close();
})();
