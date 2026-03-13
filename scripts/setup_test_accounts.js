const admin = require("firebase-admin");

try {
  const serviceAccount = require("./serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error("❌ ไม่พบไฟล์ serviceAccountKey.json");
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();
const DOMAIN = "@school.local";
const DEFAULT_PASS = "password1234";

const ACCOUNTS = [
  { u: 'superadmin', role: 'super_admin', room: 'None', name: 'Super Admin' },
  { u: 'admin1', role: 'admin', room: 'None', name: 'Teacher 1' },
  { u: 'admin2', role: 'admin', room: 'None', name: 'Teacher 2' },
  { u: 'head1', role: 'head_student', room: 'M5-1', name: 'Head Student 1' },
  { u: 'student1', role: 'student', room: 'M5-1', name: 'Student 1' }
];

async function setupAccounts() {
  for (const acc of ACCOUNTS) {
    const email = `${acc.u}${DOMAIN}`;
    console.log(`⏳ กำลังสร้าง/อัปเดตบัญชี: ${acc.u}...`);
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      await auth.updateUser(userRecord.uid, { password: DEFAULT_PASS });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        userRecord = await auth.createUser({
          email: email,
          password: DEFAULT_PASS,
          displayName: acc.name,
        });
      } else {
        console.error("❌ Error:", error);
        continue;
      }
    }
    
    await auth.setCustomUserClaims(userRecord.uid, { role: acc.role, room: acc.room });
    await db.collection("users").doc(userRecord.uid).set({
        username: acc.u,
        displayName: acc.name,
        role: acc.role,
        room: acc.room,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    console.log(`✅ สำเร็จ: ${acc.u} (${acc.role})`);
  }
  console.log(`🎉 สร้างบัญชีทดสอบเสร็จสิ้น!`);
  process.exit(0);
}

setupAccounts();
