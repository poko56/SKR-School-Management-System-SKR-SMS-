const { test, expect } = require('@playwright/test');

test('Mass Seed Users (17 Rooms x 35 Students)', async ({ page }) => {
    test.setTimeout(900000); // 15 minutes timeout
    
    // 1. Login
    await page.goto('/?v=3');
    await page.fill('#username', 'Super.Admin_SKR');
    await page.fill('#password', 'SKR_M5M5');
    await page.click('button:has-text("เข้าสู่ระบบ")');
    await page.waitForURL('**/dashboard.html**', { timeout: 30000 });
    
    // 2. Get ID Token via page evaluation
    const idToken = await page.evaluate(async () => {
        // Wait for Firebase to be ready
        await new Promise(r => setTimeout(r, 2000));
        return await firebase.auth().currentUser.getIdToken();
    });

    console.log("Got ID Token, starting mass seeding...");

    // 3. Generate User Data
    const usersToCreate = [];
    for (let r = 1; r <= 17; r++) {
        const roomName = `M5-${r}`;
        for (let s = 1; s <= 35; s++) {
            const studentNum = s.toString().padStart(2, '0');
            usersToCreate.push({
                username: `stu_${roomName.toLowerCase().replace('-','')}_${studentNum}`,
                password: 'password1234',
                displayName: `นักเรียนห้อง ${roomName} เลขที่ ${s}`,
                targetRole: 'student',
                room: roomName
            });
        }
    }

    console.log(`Total users to create: ${usersToCreate.length}`);

    // 4. Send Requests in Batches
    const BATCH_SIZE = 15; // 15 concurrent requests to avoid rate limits
    
    let createdCount = 0;
    for (let i = 0; i < usersToCreate.length; i += BATCH_SIZE) {
        const batch = usersToCreate.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} / Math.ceil(usersToCreate.length / BATCH_SIZE)`);
        
        const promises = batch.map(user => {
            return fetch('https://us-central1-krumaneerus.cloudfunctions.net/createUserWithRole', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ data: user })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    console.error(`Failed to create ${user.username}: ${data.error.message}`);
                } else {
                    createdCount++;
                }
            })
            .catch(err => console.error(`Network error for ${user.username}:`, err.message));
        });
        
        await Promise.all(promises);
        
        // short delay between batches
        await new Promise(r => setTimeout(r, 800));
    }
    
    console.log(`Mass seeding completed! Successfully created: ${createdCount} users.`);
    expect(createdCount).toBeGreaterThan(0);
});
