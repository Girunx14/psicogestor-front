const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', error => console.log('ERROR:', error.message));
  
  await page.goto('http://localhost:5174/');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Click on "Paciente" tab
  const tabs = await page.$$('button');
  for (let tab of tabs) {
    const text = await page.evaluate(el => el.textContent, tab);
    if (text === 'Paciente') {
      await tab.click();
      break;
    }
  }

  await new Promise(resolve => setTimeout(resolve, 500));
  
  await page.type('input[name="numero_control"]', '22300608');
  await page.type('input[name="fecha_nacimiento"]', '2004-12-31'); // YYYY-MM-DD
  
  // Submit portal form
  const submitBtn = await page.$$('button');
  for (let btn of submitBtn) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text === 'Entrar al Portal') {
      await btn.click();
      break;
    }
  }

  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log("Current URL after login:", page.url());
  
  await browser.close();
})();
