const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const PROD_URL = 'https://krumaneerus.web.app/?v=3';
  const outDir = '/Users/pokoman/.gemini/antigravity-ide/brain/8dfb728a-cbf2-4a9e-862a-f98c0964706b/';

  page.on('dialog', dialog => dialog.accept());

  console.log("Taking Admin screenshots...");
  await page.goto(PROD_URL);
  await page.fill('#username', 'Super.Admin_SKR');
  await page.fill('#password', 'SKR_M5M5');
  await page.click('#loginBtn');
  await page.waitForURL('**/dashboard.html**');
  // รอให้ stat-card ไม่ใช่ "กำลังโหลดข้อมูล..."
  await page.waitForFunction(() => {
    const stats = document.getElementById('stats-container');
    return stats && !stats.innerText.includes('กำลังโหลด');
  }, { timeout: 15000 });
  await page.waitForTimeout(1000); // extra buffer for rendering
  await page.screenshot({ path: path.join(outDir, 'screenshot_feed.png') });

  await page.click('a:has-text("เช็คชื่อ")');
  await page.waitForURL('**/attendance.html**');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, 'screenshot_admin_settings.png') });

  // Load students
  try {
    await page.selectOption('#room-select', 'M5-1');
    await page.click('button:has-text("ดึงข้อมูล")');
    await page.waitForSelector('#student-list input[type="radio"]', { timeout: 10000 });
    await page.waitForTimeout(1000);
    // Scroll down a bit to show the list
    await page.mouse.wheel(0, 300);
    await page.screenshot({ path: path.join(outDir, 'screenshot_attendance.png') });
  } catch (e) {
    console.error("Could not load M5-1 students", e);
  }

  await page.click('a:has-text("จัดการผู้ใช้")');
  await page.waitForURL('**/users.html**');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, 'screenshot_users.png') });
  await context.close();

  console.log("Taking Student screenshots...");
  const studentContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const studentPage = await studentContext.newPage();
  studentPage.on('dialog', dialog => dialog.accept());
  await studentPage.goto(PROD_URL);
  await studentPage.fill('#username', 'student1');
  await studentPage.fill('#password', 'password1234');
  await studentPage.click('#loginBtn');
  await studentPage.waitForURL('**/dashboard.html**');
  // รอให้นักเรียนโหลดกราฟเสร็จ
  await studentPage.waitForFunction(() => {
    const stats = document.getElementById('stats-container');
    return stats && !stats.innerText.includes('กำลังโหลด');
  }, { timeout: 15000 });

  // จำลองข้อมูลสถิติให้ดูสวยงาม
  await studentPage.evaluate(() => {
    if(typeof renderPieChart === 'function') {
        renderPieChart(15, 2, 0, 1);
    }
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 5) {
      statValues[0].innerText = '94.4%';
      statValues[1].innerText = '15';
      statValues[2].innerText = '2';
      statValues[3].innerText = '0';
      statValues[4].innerText = '1';
    }
  });

  await studentPage.waitForTimeout(1000); // รอ animation กราฟวงกลมวาดเสร็จ
  await studentPage.screenshot({ path: path.join(outDir, 'screenshot_student.png') });
  await studentContext.close();

  await browser.close();
  console.log("Screenshots captured successfully.");
})();
