const { test, expect } = require('@playwright/test');

test.describe('SKR SMS Security & Edge Cases', () => {

  const PROD_URL = 'https://krumaneerus.web.app/?v=3';

  // Helper สำหรับสร้างบัญชีทดสอบที่สามารถทำลายทิ้งได้ (แยก Role)
  // แต่เนื่องจากเราไม่รู้รหัส Super Admin ที่แท้จริงใน script นี้ เลยล็อกอินด้วย superadmin
  
  test('1.1 Spacebar Spam (Input Destruction)', async ({ page }) => {
    await page.goto(PROD_URL);
    await page.fill('#username', 'superadmin'); // ใช้บัญชีแอดมินทดสอบ
    await page.fill('#password', 'password1234');
    await page.click('#loginBtn');
    await page.waitForURL('**/dashboard.html**');

    // ไปที่ช่องประกาศ เคาะ Spacebar รัวๆ
    await page.fill('#post-content', '          ');
    
    // ดักจับ Alert
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    await page.click('#btn-post');
    await page.waitForTimeout(500); // รอ Alert
    expect(alertMessage).toContain('กรุณาพิมพ์ข้อความ');
  });

  test('1.2 XSS Attack (Cross-site Scripting)', async ({ page }) => {
    await page.goto(PROD_URL);
    await page.fill('#username', 'superadmin');
    await page.fill('#password', 'password1234');
    await page.click('#loginBtn');
    await page.waitForURL('**/dashboard.html**');

    const xssPayload = "<script>alert('เว็บโดนแฮกแล้ว!')</script>";
    await page.fill('#post-content', xssPayload);
    
    // หน้าเว็บต้องไม่แสดง Alert ที่เกิดจาก Payload
    let hackAlerted = false;
    page.on('dialog', async dialog => {
      if (dialog.message() === 'เว็บโดนแฮกแล้ว!') {
        hackAlerted = true;
      }
      await dialog.accept();
    });

    await page.click('#btn-post');
    await page.waitForTimeout(2000); // รอฟีดอัพเดต

    // ห้ามมี Alert เกิดขึ้น
    expect(hackAlerted).toBeFalsy();

    // ต้องเห็นตัวอักษร HTML เป๊ะๆ บนหน้าเว็บ (เนื่องจากถูก escapeHTML)
    await expect(page.locator('.feed-content', { hasText: xssPayload }).first()).toBeVisible();
  });

    test('4.1 Spam Posts (Lock button)', async ({ page }) => {
    await page.goto(PROD_URL);
    await page.fill('#username', 'superadmin');
    await page.fill('#password', 'password1234');
    await page.click('#loginBtn');
    await page.waitForURL('**/dashboard.html**');

    await page.fill('#post-content', 'ทดสอบกดสแปม');
    
    // ดักจับ Alert หากโพสต์ผิดพลาด (เช่น โดนบล็อกหรือ Rate Limit)
    page.on('dialog', async dialog => {
      console.log('Dialog message:', dialog.message());
      await dialog.accept();
    });

    // คลิกปุ่มอย่างรวดเร็วเพื่อพยายามส่งคำขอซ้ำ
    const postBtn = page.locator('#btn-post');
    await postBtn.click();
    
    // คาดหวังว่าปุ่มจะถูก Disabled ทันทีหลังจากคลิกครั้งแรก
    await expect(postBtn).toBeDisabled();
    
    // รอจนปุ่มกลับมากดได้อีกครั้ง (หลัง post เสร็จ) คลูดฟังก์ชันอาจใช้เวลาเริ่มต้น
    await expect(postBtn).toBeEnabled({ timeout: 15000 });
  });

  test('6.3 ลบ Disabled (Inspect Element): เปลี่ยนห้องเช็คชื่อ', async ({ page }) => {
    // สมมติว่าล็อกอินเป็น head1
    await page.goto(PROD_URL);
    await page.fill('#username', 'head1'); 
    await page.fill('#password', 'password1234');
    
    // ดักจับ alert ไว้ก่อนเลย เผื่อล็อกอินไม่ผ่าน
    let loginFailed = false;
    let authDialogHandler = async dialog => {
      loginFailed = true;
      await dialog.accept();
    };
    page.on('dialog', authDialogHandler);
    
    await page.click('#loginBtn');
    
    // ถ้ารหัสไม่มีใน DB การรันเทสนี้จะข้ามไปหรือล้มเหลว
    await page.waitForURL('**/dashboard.html**', { timeout: 5000 }).catch(() => {});
    if (loginFailed || !page.url().includes('dashboard.html')) {
        test.skip('Skipping test 6.3 because head1 account does not exist or login failed.');
        return;
    }
    page.off('dialog', authDialogHandler); // เอา handler เดิมออก

    // ไปหน้าระบบเช็คชื่อ
    await page.click('a:has-text("เช็คชื่อ (Attendance)")');
    await page.waitForURL('**/attendance.html**');

    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    // โหลดข้อมูลห้องตัวเองก่อน (M5-1)
    await page.click('button:has-text("ดึงข้อมูล")');
    await page.waitForTimeout(1500);

    // === จำลอง Inspect Element: ลบ disabled แล้วแอบเปลี่ยนห้องหลังโหลดข้อมูลแล้ว ===
    // เปลี่ยน room-select value ตรงหน้าเว็บก่อน save เพื่อทดสอบ backend block
    await page.evaluate(() => {
      const rs = document.getElementById('room-select');
      rs.removeAttribute('disabled');
      rs.value = 'M1-1'; // แอบเปลี่ยนห้องเป็น M1-1 ซึ่งไม่ใช่ห้องของตัวเอง
    });

    // สมมติว่าติ๊กเช็คชื่อคนแรก
    const firstCheckbox = page.locator('input[type="radio"][value="present"]').first();
    if(await firstCheckbox.isVisible()) {
        await firstCheckbox.check();
    }
    
    // กดปุ่มบันทึก — backend ต้องอ่าน room-select ที่ถูกแฮก
    await page.click('#btn-save-att');
    await page.waitForTimeout(3000);

    // ต้องโดนเตะกลับ (Permission Denied) จาก Backend Cloud Function
    expect(alertMessage).toContain('ไม่มีสิทธิ์เช็คชื่อข้ามห้องตัวเอง!');
  });

  test('6.4 เสกปุ่มซ่อน (Inspect Element): นักเรียนแอบโพสต์ประกาศ', async ({ page }) => {
    await page.goto(PROD_URL);
    await page.fill('#username', 'student1'); 
    await page.fill('#password', 'password1234');
    
    let loginFailed = false;
    let authDialogHandler = async dialog => {
      loginFailed = true;
      await dialog.accept();
    };
    page.on('dialog', authDialogHandler);
    
    await page.click('#loginBtn');
    
    await page.waitForURL('**/dashboard.html**', { timeout: 5000 }).catch(() => {});
    if (loginFailed || !page.url().includes('dashboard.html')) {
        test.skip('Skipping test 6.4 because student1 account does not exist or login failed.');
        return;
    }
    page.off('dialog', authDialogHandler);

    // ลบ display none ออก
    await page.evaluate(() => {
        document.getElementById('admin-post-section').style.display = 'block';
    });

    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    // พิมพ์ขยะ
    await page.fill('#post-content', 'แฝงตัวโพสต์ประกาศ');
    await page.click('#btn-post');
    await page.waitForTimeout(2000);

    expect(alertMessage).toContain('แอดมินเท่านั้น');
  });

});
