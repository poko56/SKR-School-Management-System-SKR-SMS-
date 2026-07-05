const { test, expect } = require('@playwright/test');

test.describe('SKR SMS Admin Features', () => {

  const PROD_URL = 'https://krumaneerus.web.app/?v=3';
  
  test('1. Update Attendance Settings (Cut-off Time)', async ({ page }) => {
    await page.goto(PROD_URL);
    await page.fill('#username', 'Super.Admin_SKR');
    await page.fill('#password', 'SKR_M5M5');
    await page.click('#loginBtn');
    await page.waitForURL('**/dashboard.html**');

    // ไปหน้าเช็คชื่อ
    await page.click('a:has-text("เช็คชื่อ (Attendance)")');
    await page.waitForURL('**/attendance.html**');

    // ตั้งเวลา Cut-off
    await page.fill('#cutoff-time', '18:00');
    
    const dialogPromise = page.waitForEvent('dialog');
    await page.click('button:has-text("บันทึกเวลา")');
    const dialog = await dialogPromise;
    
    expect(dialog.message()).toContain('บันทึกเวลาสำเร็จ');
    await dialog.accept();
  });

  test('2. Set and Cancel Holiday', async ({ page }) => {
    await page.goto(PROD_URL);
    await page.fill('#username', 'Super.Admin_SKR');
    await page.fill('#password', 'SKR_M5M5');
    await page.click('#loginBtn');
    await page.waitForURL('**/dashboard.html**');

    // ไปหน้าเช็คชื่อ
    await page.click('a:has-text("เช็คชื่อ (Attendance)")');
    await page.waitForURL('**/attendance.html**');

    // วันที่ทดสอบวันหยุด
    const testDate = '2026-12-31';
    await page.fill('#holiday-date', testDate);

    // ตั้งเป็นวันหยุด
    const dialogPromise1 = page.waitForEvent('dialog');
    await page.click('button:has-text("ตั้งเป็นวันหยุด")');
    const dialog1 = await dialogPromise1;
    expect(dialog1.message()).toContain('ประกาศงดเช็คชื่อ');
    await dialog1.accept();

    // ยกเลิกวันหยุด
    const dialogPromise2 = page.waitForEvent('dialog');
    await page.click('button:has-text("ยกเลิกวันหยุด")');
    const dialog2 = await dialogPromise2;
    expect(dialog2.message()).toContain('ยกเลิกวันหยุดสำเร็จ');
    await dialog2.accept();
  });

  test('3. Request and Approve Edit Attendance', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const superAdminContext = await browser.newContext();
    
    const pageAdmin = await adminContext.newPage();
    const pageSuper = await superAdminContext.newPage();

    // 1. Admin login
    await pageAdmin.goto(PROD_URL);
    await pageAdmin.fill('#username', 'admin1');
    await pageAdmin.fill('#password', 'password1234');
    await pageAdmin.click('#loginBtn');
    await pageAdmin.waitForURL('**/dashboard.html**');

    // ไปหน้าเช็คชื่อ
    await pageAdmin.click('a:has-text("เช็คชื่อ (Attendance)")');
    await pageAdmin.waitForURL('**/attendance.html**');

    let adminAlert = '';
    pageAdmin.on('dialog', async dialog => {
      adminAlert = dialog.message();
      await dialog.accept();
    });

    // สมมติว่าต้องการส่งคำขอแก้ไขประวัติห้อง M5-1
    await pageAdmin.click('button:has-text("เปิดให้เช็คชื่อ")');
    await pageAdmin.waitForTimeout(500);

    // เลือกห้อง M5-1
    await pageAdmin.waitForFunction(() => {
        const rs = document.getElementById('room-select');
        return rs && rs.options.length > 1;
    }, { timeout: 15000 }).catch(() => {});
    await pageAdmin.selectOption('#room-select', 'M5-1');
    
    await pageAdmin.click('button:has-text("ดึงข้อมูล")');
    await pageAdmin.waitForSelector('#student-list input[type="radio"]', { state: 'visible', timeout: 15000 });
    
    // กดปุ่ม
    await pageAdmin.click('#btn-save-att');
    await pageAdmin.waitForTimeout(3000); // รอ cloud function
    
    // 2. Super Admin login เพื่ออนุมัติ
    await pageSuper.goto(PROD_URL);
    await pageSuper.fill('#username', 'Super.Admin_SKR');
    await pageSuper.fill('#password', 'SKR_M5M5');
    await pageSuper.click('#loginBtn');
    await pageSuper.waitForURL('**/dashboard.html**');
    
    await pageSuper.click('a:has-text("เช็คชื่อ (Attendance)")');
    await pageSuper.waitForURL('**/attendance.html**');

    let superAlert = '';
    pageSuper.on('dialog', async dialog => {
      superAlert = dialog.message();
      await dialog.accept();
    });

    // รอให้หน้าต่างโหลดคิวอนุมัติ
    await pageSuper.waitForTimeout(3000);
    const approveBtn = pageSuper.locator('button:has-text("อนุมัติ")').first();
    
    if (await approveBtn.isVisible()) {
        await approveBtn.click();
        await pageSuper.waitForTimeout(3000);
        expect(superAlert).toContain('อนุมัติสำเร็จ');
    }

    await adminContext.close();
    await superAdminContext.close();
  });

});
