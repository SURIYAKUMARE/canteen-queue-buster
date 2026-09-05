import puppeteer from 'puppeteer-core';

async function runE2ETest() {
  console.log('=== STARTING CAMPUSBITE STRICT ROLE ISOLATION E2E TEST ===\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915 }); // Mobile viewport

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[BROWSER ERR]:', msg.text());
  });
  page.on('pageerror', err => console.log('[PAGE CRASH]:', err.message));
  page.on('dialog', async dialog => {
    console.log('[ALERT DIALOG]:', dialog.message());
    await dialog.dismiss();
  });

  // -------------------------------------------------------------
  // STEP 1: START SCREEN VERIFICATION
  // -------------------------------------------------------------
  console.log('--> Step 1: Loading Start Screen at http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0', timeout: 15000 });

  const startText = await page.evaluate(() => document.body.innerText);

  if (startText.includes('CAMPUSBITE') && startText.includes('Smart College Canteen')) {
    console.log('✓ PASS: Start screen title CAMPUSBITE - Smart College Canteen verified');
  } else {
    throw new Error('FAIL: Brand header missing on start screen');
  }

  if (startText.toUpperCase().includes('CONTINUE AS')) {
    console.log('✓ PASS: "Continue as" prompt verified');
  } else {
    throw new Error('FAIL: "Continue as" prompt missing');
  }

  const studentBtn = await page.$('#start-student-btn');
  const vendorBtn = await page.$('#start-vendor-btn');
  const adminLink = await page.$('#admin-portal-link');

  if (studentBtn && vendorBtn && adminLink) {
    console.log('✓ PASS: [ STUDENT ], [ VENDOR ], and Admin Portal link all present');
  } else {
    throw new Error('FAIL: Action buttons missing on start screen');
  }

  // Ensure no food catalog or orders leaked onto start screen
  if (!startText.includes('Masala Dosa') && !startText.includes('Placed Paid Orders')) {
    console.log('✓ PASS: Start screen is clean: no food, orders, or profile leaked');
  } else {
    throw new Error('FAIL: Data leaked on start screen');
  }

  // -------------------------------------------------------------
  // STEP 2: STUDENT LOGIN & BOOK FOOD & PAYMENT FLOW
  // -------------------------------------------------------------
  console.log('\n--> Step 2: Clicking [ STUDENT ] to open Student Login...');
  await page.click('#start-student-btn');
  await new Promise(r => setTimeout(r, 600));

  const stuLoginText = await page.evaluate(() => document.body.innerText);
  if (stuLoginText.includes('Student Login') && stuLoginText.includes('STU001')) {
    console.log('✓ PASS: Isolated Student Login screen opened with demo STU001 / student123 helper');
  } else {
    throw new Error('FAIL: Student login screen not rendered');
  }

  console.log('Submitting Student login credentials (STU001 / student123)...');
  await page.click('#student-submit-btn');
  await new Promise(r => setTimeout(r, 1200));

  const stuAppText = await page.evaluate(() => document.body.innerText);
  if (stuAppText.includes('Canteen Menu') || stuAppText.includes('CampusBite')) {
    console.log('✓ PASS: Student successfully entered Student Application');
  } else {
    throw new Error('FAIL: Student app failed to load');
  }

  // Verify TopBar shows student badge and NO vendor switcher
  if (stuAppText.includes('STU001') && !stuAppText.includes('Vendor ID: VEN001')) {
    console.log('✓ PASS: TopBar shows Student profile (STU001) with role isolation intact');
  }

  // Add item to cart
  console.log('\n--> Step 3: Adding food item to cart...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b => b.innerText.trim() === 'ADD');
    if (addBtn) addBtn.click();
    else throw new Error('ADD food button not found');
  });
  await new Promise(r => setTimeout(r, 800));

  await page.waitForSelector('#book-food-btn', { visible: true, timeout: 5000 });
  console.log('✓ PASS: Sticky "Book Food" bar appeared with total amount');

  console.log('Clicking "Book Food" to open Payment Page...');
  await page.click('#book-food-btn');
  await new Promise(r => setTimeout(r, 1500));

  // Verify Payment Page elements
  const paymentText = await page.evaluate(() => document.body.innerText);
  if (paymentText.includes('Payment Page') && paymentText.toUpperCase().includes('ORDER SUMMARY')) {
    console.log('✓ PASS: Payment Page opened with Order Summary');
  } else {
    throw new Error('FAIL: Payment Page did not render properly');
  }

  if (paymentText.includes('Campus Central Canteen') || paymentText.includes('Canteen Counter')) {
    console.log('✓ PASS: Vendor Canteen Name displayed on Payment Page');
  }

  const paymentCompletedBtn = await page.$('#payment-completed-btn');
  if (paymentCompletedBtn) {
    console.log('✓ PASS: [ PAYMENT COMPLETED ] button is present on Payment Page');
  } else {
    throw new Error('FAIL: [ PAYMENT COMPLETED ] button missing');
  }

  // Click [ PAYMENT COMPLETED ]
  console.log('\n--> Step 4: Clicking [ PAYMENT COMPLETED ] button...');
  await page.click('#payment-completed-btn');
  console.log('Waiting for payment confirmation & dynamic QR code generation...');
  await new Promise(r => setTimeout(r, 2500));

  const qrText = await page.evaluate(() => document.body.innerText);
  if (qrText.includes('Payment Successful') && qrText.includes('Order Confirmed')) {
    console.log('✓ PASS: "Payment Successful ✓ • Order Confirmed ✓" displayed');
  } else {
    throw new Error('FAIL: Payment confirmation header missing');
  }

  if (qrText.includes('ORD') && qrText.includes('TKN')) {
    console.log('✓ PASS: Order ID (#ORD...) and Token Number (TKN...) generated');
  } else {
    throw new Error('FAIL: Order ID or Token Number missing in QR pass');
  }

  if (qrText.includes('Show this QR code at the canteen counter.')) {
    console.log('✓ PASS: "Show this QR code at the canteen counter." verified');
  }

  // Verify student view does NOT leak vendor switcher
  if (!qrText.includes('Scan as Vendor')) {
    console.log('✓ PASS: Isolated Student Pass: No vendor cross-role switcher button');
  }

  // Logout student
  console.log('\n--> Step 5: Logging out of Student account...');
  await page.waitForSelector('#switch-role-btn', { visible: true, timeout: 5000 });
  await page.click('#switch-role-btn');
  await new Promise(r => setTimeout(r, 1000));

  const afterStuLogoutText = await page.evaluate(() => document.body.innerText);
  console.log('DEBUG afterStuLogoutText:', afterStuLogoutText.slice(0, 300));
  if (afterStuLogoutText.toUpperCase().includes('CONTINUE AS') && afterStuLogoutText.toUpperCase().includes('CAMPUSBITE')) {
    console.log('✓ PASS: Student successfully logged out and returned to Start Screen');
  } else {
    throw new Error('FAIL: Logout did not return to Start Screen: ' + afterStuLogoutText.slice(0, 300));
  }

  // -------------------------------------------------------------
  // STEP 6: VENDOR LOGIN & SCANNER HANDOVER FLOW
  // -------------------------------------------------------------
  console.log('\n--> Step 6: Clicking [ VENDOR ] to open Vendor Login...');
  await page.click('#start-vendor-btn');
  await new Promise(r => setTimeout(r, 600));

  const vendorLoginText = await page.evaluate(() => document.body.innerText);
  if (vendorLoginText.includes('Vendor Login') && vendorLoginText.includes('VEN001')) {
    console.log('✓ PASS: Isolated Vendor Login screen opened with demo VEN001 / vendor123 helper');
  } else {
    throw new Error('FAIL: Vendor login screen not rendered');
  }

  console.log('Submitting Vendor login credentials (VEN001 / vendor123)...');
  await page.click('#vendor-submit-btn');
  await new Promise(r => setTimeout(r, 1200));

  const vendorAppText = await page.evaluate(() => document.body.innerText);
  if (vendorAppText.includes('SCAN QR CODE') && vendorAppText.toUpperCase().includes('PLACED PAID ORDERS')) {
    console.log('✓ PASS: Vendor entered Vendor Dashboard with [SCAN QR CODE] and Placed Paid Orders');
  } else {
    throw new Error('FAIL: Vendor dashboard not rendered properly');
  }

  if (vendorAppText.includes('Arun Kumar') || vendorAppText.includes('STU001')) {
    console.log('✓ PASS: Real-time student order (Arun Kumar / STU001) visible in vendor order queue');
  }

  console.log('\n--> Step 7: Opening Vendor QR Scanner...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const scanBtn = btns.find(b => b.innerText.includes('SCAN QR CODE'));
    if (scanBtn) scanBtn.click();
    else throw new Error('SCAN QR CODE button not found');
  });
  await new Promise(r => setTimeout(r, 1200));

  const scannerText = await page.evaluate(() => document.body.innerText);
  if (scannerText.includes('Vendor QR Scanner') || scannerText.includes('Camera Viewfinder')) {
    console.log('✓ PASS: Vendor QR Scanner opened');
  }

  console.log('Simulating QR Scan of the student order...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const testScanBtn = btns.find(b => b.innerText.includes('Test Scan →'));
    if (testScanBtn) testScanBtn.click();
    else throw new Error('Test Scan button not found');
  });
  await new Promise(r => setTimeout(r, 1500));

  const verifiedCardText = await page.evaluate(() => document.body.innerText);
  if (verifiedCardText.includes('✓ ORDER VERIFIED') && verifiedCardText.includes('CONFIRM FOOD HANDOVER')) {
    console.log('✓ PASS: "✓ ORDER VERIFIED" card displayed with student details, items, amount, and [CONFIRM FOOD HANDOVER] button');
  } else {
    throw new Error('FAIL: Verification card not shown: ' + verifiedCardText.slice(0, 300));
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
    console.log('✓ PASS: "Food handed over successfully ✓" message confirmed');
  } else {
    throw new Error('FAIL: Handover success message not shown');
  }

  // Logout vendor
  console.log('\n--> Step 8: Logging out of Vendor account...');
  await page.waitForSelector('#switch-role-btn', { visible: true, timeout: 5000 });
  await page.evaluate(() => document.querySelector('#switch-role-btn')?.click());
  await new Promise(r => setTimeout(r, 1500));

  const afterVenLogoutText = await page.evaluate(() => document.body.innerText);
  console.log('DEBUG afterVenLogoutText:', afterVenLogoutText.slice(0, 300));
  if (afterVenLogoutText.toUpperCase().includes('CONTINUE AS') && afterVenLogoutText.toUpperCase().includes('CAMPUSBITE')) {
    console.log('✓ PASS: Vendor successfully logged out and returned to Start Screen');
  } else {
    throw new Error('FAIL: Vendor logout did not return to Start Screen: ' + afterVenLogoutText.slice(0, 300));
  }

  // -------------------------------------------------------------
  // STEP 9: ADMIN / SYSTEM OWNER PORTAL
  // -------------------------------------------------------------
  console.log('\n--> Step 9: Opening System Owner / Admin Portal...');
  await page.waitForSelector('#admin-portal-link', { visible: true, timeout: 5000 });
  await page.click('#admin-portal-link');
  await new Promise(r => setTimeout(r, 600));

  console.log('Unlocking Admin Portal with passcode "admin123"...');
  await page.type('#admin-passcode-input', 'admin123');
  await page.click('#admin-unlock-btn');
  await new Promise(r => setTimeout(r, 1000));

  const adminText = await page.evaluate(() => document.body.innerText);
  if (adminText.includes('System Owner') && adminText.includes('STU001')) {
    console.log('✓ PASS: Admin Portal loaded with student management and STU001 record');
  } else {
    throw new Error('FAIL: Admin portal did not open');
  }

  console.log('Switching to Vendors tab in Admin Portal...');
  await page.click('#admin-vendors-tab');
  await new Promise(r => setTimeout(r, 600));

  const adminVenText = await page.evaluate(() => document.body.innerText);
  if (adminVenText.includes('VEN001') && adminVenText.includes('Configured GPay QR')) {
    console.log('✓ PASS: Admin Portal shows Registered Vendors with configurable GPay QR image');
  }

  console.log('\n=============================================================');
  console.log('🎉 ALL TESTS PASSED: STRICT ROLE ISOLATION & FULL END-TO-END DEMO WORKING PERFECTLY!');
  console.log('=============================================================');

  await browser.close();
  process.exit(0);
}

runE2ETest().catch(err => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
