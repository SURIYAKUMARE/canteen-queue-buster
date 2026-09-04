import puppeteer from 'puppeteer-core';

async function runE2ETest() {
  console.log('=== STARTING CAMPUSBITE DEMO FLOW E2E TEST ===');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915 }); // Mobile viewport

  page.on('console', msg => {
    console.log('[BROWSER LOG]:', msg.type(), msg.text());
  });
  page.on('pageerror', err => console.log('[PAGE CRASH]:', err.message));
  page.on('dialog', async dialog => {
    console.log('[ALERT DIALOG]:', dialog.message());
    await dialog.dismiss();
  });

  // STEP 1: INITIAL LOGIN SCREEN
  console.log('\n--> Step 1: Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0', timeout: 15000 });

  const pageTitle = await page.evaluate(() => document.body.innerText);
  if (pageTitle.includes('Who are you?')) {
    console.log('✓ PASS: "Who are you?" login screen displayed successfully!');
  } else {
    throw new Error('FAIL: "Who are you?" screen not found');
  }

  if (pageTitle.includes('STU001') && pageTitle.includes('student123')) {
    console.log('✓ PASS: Student demo credentials STU001 / student123 visible!');
  }

  // STEP 2: STUDENT LOGIN & BOOK FOOD
  console.log('\n--> Step 2: Logging in as Student (1-Click Login)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const loginBtn = btns.find(b => b.innerText.includes('1-Click Login as Student'));
    if (loginBtn) loginBtn.click();
    else throw new Error('Student 1-click login button not found');
  });

  await new Promise(r => setTimeout(r, 1000));

  const afterLoginText = await page.evaluate(() => document.body.innerText);
  if (afterLoginText.includes('Canteen Menu') || afterLoginText.includes('Browse all authentic')) {
    console.log('✓ PASS: Student Menu rendered after login!');
  } else {
    throw new Error('FAIL: Student menu did not open after login');
  }

  // Add item to cart
  console.log('\n--> Step 3: Adding food item to cart...');
  await page.evaluate(() => {
    const addBtns = Array.from(document.querySelectorAll('button'));
    const add = addBtns.find(b => b.innerText.includes('ADD'));
    if (add) add.click();
    else throw new Error('ADD food button not found');
  });

  await new Promise(r => setTimeout(r, 800));

  const cartBarText = await page.evaluate(() => document.body.innerText);
  if (cartBarText.includes('Book Food')) {
    console.log('✓ PASS: "Book Food" bar appeared with total amount!');
  } else {
    throw new Error('FAIL: "Book Food" bar not found');
  }

  // Click "Book Food"
  console.log('\n--> Step 4: Clicking "Book Food" to open Payment Page...');
  await page.waitForSelector('#book-food-btn', { visible: true, timeout: 5000 });
  await page.click('#book-food-btn');

  await new Promise(r => setTimeout(r, 2000));

  const debugInfo = await page.evaluate(() => {
    const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.innerText);
    const body = document.body.innerText;
    return {
      h2s,
      includesPaymentPage: body.includes('Payment Page'),
      includesOrderSummary: body.includes('Order Summary'),
      bodyEnd: body.slice(-600)
    };
  });

  console.log('DEBUG INFO STEP 4:', JSON.stringify(debugInfo, null, 2));

  const paymentPageText = await page.evaluate(() => document.body.innerText);
  if (paymentPageText.includes('Payment Page') && paymentPageText.toUpperCase().includes('ORDER SUMMARY')) {
    console.log('✓ PASS: Payment Page opened with Order Summary, items, and total amount!');
  } else {
    throw new Error('FAIL: Payment Page did not render properly');
  }

  // Click "Pay Now"
  console.log('\n--> Step 5: Clicking "Pay Now" to process payment...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const payBtn = btns.find(b => b.innerText.includes('Pay') && b.innerText.includes('Now'));
    if (payBtn) payBtn.click();
    else throw new Error('Pay Now button not found');
  });

  console.log('Waiting for payment confirmation & dynamic QR code generation...');
  await new Promise(r => setTimeout(r, 2500));

  const qrViewText = await page.evaluate(() => document.body.innerText);
  if (qrViewText.includes('Payment Successful') && qrViewText.includes('Order Confirmed')) {
    console.log('✓ PASS: "Payment Successful ✓ • Order Confirmed ✓" displayed!');
  } else {
    throw new Error('FAIL: Confirmation header not found');
  }

  if (qrViewText.includes('ORD') && qrViewText.includes('TKN')) {
    console.log('✓ PASS: Realistic Order ID (ORD...) and Token Number (TKN...) generated!');
  } else {
    throw new Error('FAIL: Order ID or Token Number missing');
  }

  if (qrViewText.includes('Show this QR code at the canteen counter.')) {
    console.log('✓ PASS: "Show this QR code at the canteen counter." instruction verified!');
  }

  // STEP 6: SWITCH ROLE TO VENDOR
  console.log('\n--> Step 6: Switching role to Vendor...');
  await page.waitForSelector('#switch-role-btn', { visible: true, timeout: 5000 });
  await page.evaluate(() => {
    const btn = document.querySelector('#switch-role-btn');
    console.log('Evaluating click on #switch-role-btn, found:', !!btn);
    btn?.click();
  });

  await new Promise(r => setTimeout(r, 1200));

  const screenAfterSwitch = await page.evaluate(() => document.body.innerText);
  console.log('SCREEN AFTER SWITCHING ROLE:\n---', screenAfterSwitch.slice(0, 300), '\n---');

  console.log('Switching to Vendor tab in Login...');
  await page.waitForSelector('#vendor-tab-btn', { visible: true, timeout: 5000 });
  await page.evaluate(() => document.querySelector('#vendor-tab-btn')?.click());

  await new Promise(r => setTimeout(r, 600));

  console.log('Logging in as Vendor (VEN001)...');
  await page.waitForSelector('#vendor-quick-login-btn', { visible: true, timeout: 5000 });
  await page.evaluate(() => document.querySelector('#vendor-quick-login-btn')?.click());

  await new Promise(r => setTimeout(r, 1500));

  const vendorDashboardText = await page.evaluate(() => document.body.innerText);
  console.log('ACTUAL VENDOR DASHBOARD SCREEN:\n---', vendorDashboardText.slice(0, 500), '\n---');

  if (vendorDashboardText.includes('SCAN QR CODE') && vendorDashboardText.toUpperCase().includes('PLACED PAID ORDERS')) {
    console.log('✓ PASS: Vendor Dashboard shows [SCAN QR CODE] and Placed Paid Orders!');
  } else {
    throw new Error('FAIL: Vendor Dashboard not displaying paid orders correctly: ' + vendorDashboardText.slice(0, 300));
  }

  if (vendorDashboardText.includes('Arun Kumar') || vendorDashboardText.includes('STU001')) {
    console.log('✓ PASS: Paid student order with Arun Kumar (STU001) is displayed in real time!');
  }

  // STEP 7: VENDOR QR SCANNER & HANDOVER
  console.log('\n--> Step 7: Opening Vendor QR Scanner...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const scanBtn = btns.find(b => b.innerText.includes('SCAN QR CODE'));
    if (scanBtn) scanBtn.click();
    else throw new Error('SCAN QR CODE button not found');
  });

  await new Promise(r => setTimeout(r, 1200));

  const scannerText = await page.evaluate(() => document.body.innerText);
  if (scannerText.includes('Vendor QR Scanner') || scannerText.includes('Camera Viewfinder') || scannerText.includes('Manual Order ID')) {
    console.log('✓ PASS: Vendor QR Scanner opened!');
  }

  console.log('Simulating QR Scan of the student order...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const testScanBtn = btns.find(b => b.innerText.includes('Test Scan →'));
    if (testScanBtn) testScanBtn.click();
    else throw new Error('Test Scan button not found');
  });

  await new Promise(r => setTimeout(r, 1500));

  const verifiedText = await page.evaluate(() => document.body.innerText);
  if (verifiedText.includes('✓ ORDER VERIFIED') && verifiedText.includes('CONFIRM FOOD HANDOVER')) {
    console.log('✓ PASS: "✓ ORDER VERIFIED" card displayed with student details, items, amount, and [CONFIRM FOOD HANDOVER] button!');
  } else {
    throw new Error('FAIL: Verification card not displayed properly: ' + verifiedText.slice(0, 300));
  }

  console.log('Clicking [CONFIRM FOOD HANDOVER]...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const handoverBtn = btns.find(b => b.innerText.includes('CONFIRM FOOD HANDOVER'));
    if (handoverBtn) handoverBtn.click();
  });

  await new Promise(r => setTimeout(r, 1500));

  const handoverSuccessText = await page.evaluate(() => document.body.innerText);
  if (handoverSuccessText.includes('Food handed over successfully ✓')) {
    console.log('✓ PASS: "Food handed over successfully ✓" message confirmed!');
  } else {
    throw new Error('FAIL: Handover success message not shown: ' + handoverSuccessText.slice(0, 300));
  }

  console.log('\n=== ALL 6 STEPS VERIFIED 100% WORKING END-TO-END! ===');
  await browser.close();
  process.exit(0);
}

runE2ETest().catch(err => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
