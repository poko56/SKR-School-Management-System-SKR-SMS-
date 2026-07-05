const { test, expect } = require('@playwright/test');

const USERS_TO_CREATE = [
  { u: 'admin1', p: 'password1234', r: 'admin', room: 'None' },
  { u: 'admin2', p: 'password1234', r: 'admin', room: 'None' },
  { u: 'head1', p: 'password1234', r: 'head_student', room: 'None' },
  { u: 'student1', p: 'password1234', r: 'student', room: 'None' },
  { u: 'head_m51', p: 'password1234', r: 'head_student', room: 'M5-1' },
  { u: 'head_m52', p: 'password1234', r: 'head_student', room: 'M5-2' },
  { u: 'head_m53', p: 'password1234', r: 'head_student', room: 'M5-3' },
  { u: 'head_m54', p: 'password1234', r: 'head_student', room: 'M5-4' },
  { u: 'head_m55', p: 'password1234', r: 'head_student', room: 'M5-5' }
];

test('Seed Test Accounts', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes timeout
    await page.goto('/?v=3');
    await page.fill('#username', 'Super.Admin_SKR');
    await page.fill('#password', 'SKR_M5M5');
    await page.click('button:has-text("เข้าสู่ระบบ")');
    await page.waitForURL('**/dashboard.html**', { timeout: 30000 });
    
    await page.goto('/users.html');
    
    // Automatically accept any dialogs like "Created successfully"
    page.on('dialog', dialog => dialog.accept());

    for (const user of USERS_TO_CREATE) {
        console.log(`Creating user: ${user.u}`);
        await page.fill('#new-username', user.u);
        await page.fill('#new-password', user.p);
        await page.selectOption('#new-role', user.r);
        
        if (user.r === 'head_student' || user.r === 'student') {
             // ensure #new-room is visible
             const isVisible = await page.isVisible('#new-room');
             if (isVisible) {
                 await page.selectOption('#new-room', user.room);
             }
        }
        
        await page.click('#btn-create');
        // wait for a bit to let the cloud function complete
        await page.waitForTimeout(5000);
    }
});
