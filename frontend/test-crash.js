const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err.toString());
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('CONSOLE ERROR:', msg.text());
    }
  });

  try {
    await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle2' });
  } catch(e) {
    console.error('GOTO ERROR:', e.message);
  }
  
  await browser.close();
})();
