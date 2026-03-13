const admin = require("firebase-admin");
const path = require("path");

// 1. ตรวจสอบว่ามีไฟล์ Service Account Key ไหม
try {
  const serviceAccount = require("./serviceAccountKey.json");

  // 2. Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error("❌ ไม่พบไฟล์ serviceAccountKey.json");
  console.error("👉 กรุณาดาวน์โหลดไฟล์นี้จาก Firebase Console (Project Settings > Service Accounts)");
  console.error("👉 แล้วนำมาวางในโฟลเดอร์ scripts/ โดยตั้งชื่อเป็น 'serviceAccountKey.json'");
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();
const DOMAIN = "@school.local";

// 🔧 ตั้งค่า Username และ Password ของ Super Admin ที่ต้องการสร้าง
const SUPER_ADMIN_USERNAME = "superadmin"; // กรอก Username ที่ต้องการ
const SUPER_ADMIN_PASSWORD = "password1234"; // กรอก Password ที่ต้องการ (ขั้นต่ำ 6 ตัวอักษร)
const SUPER_ADMIN_EMAIL = `${SUPER_ADMIN_USERNAME}${DOMAIN}`;

async function setupSuperAdmin() {
  console.log(`⏳ กำลังสร้าง/อัปเดตบัญชี Super Admin: ${SUPER_ADMIN_USERNAME}...`);

  let userRecord;
  try {
    // ลองดึงข้อมูล User ก่อน ถ้ามีอยู่แล้วจะได้ไม่ Error
    userRecord = await auth.getUserByEmail(SUPER_ADMIN_EMAIL);
    console.log(`✅พบบัญชีเดิมอยู่แล้ว (UID: ${userRecord.uid}) จะทำการอัปเดตรหัสผ่านใหม่...`);
    
    // อัปเดตรหัสผ่าน
    userRecord = await auth.updateUser(userRecord.uid, {
      password: SUPER_ADMIN_PASSWORD
    });

  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      // ถ้ายัังไม่มีบัญชี ให้สร้างใหม่
      console.log(`✨ ยังไม่มีบัญชี กำลังสร้างใหม่...`);
      userRecord = await auth.createUser({
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD,
        displayName: "Super Admin (ผู้อำนวยการ)",
      });
    } else {
      console.error("❌ เกิดข้อผิดพลาดในการจัดการบัญชี:", error);
      process.exit(1);
    }
  }

  // 3. กำหนด Custom Claims สิทธิ์ super_admin
  try {
    await auth.setCustomUserClaims(userRecord.uid, { 
        role: "super_admin",
        room: "None"
    });
    console.log(`✅ ให้สิทธิ์ 'super_admin' สำเร็จ!`);

    // 4. บันทึกข้อมูลลงใน Database (Firestore - Collection: users)
    await db.collection("users").doc(userRecord.uid).set({
        username: SUPER_ADMIN_USERNAME,
        displayName: "Super Admin",
        role: "super_admin",
        room: "None",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true }); // ใช้ merge: true เพื่อไม่ให้ข้อมูลอื่นหายถ้ามีอยู่แล้ว
    
    console.log(`🎉 สร้าง Super Admin เสร็จสิ้น!`);
    console.log(`👉 Username สำหรับ Login: ${SUPER_ADMIN_USERNAME}`);
    console.log(`👉 Password: ${SUPER_ADMIN_PASSWORD}`);
    
  } catch(e) {
      console.error("❌ ขั้นตอนตั้งค่าสิทธิ์ล้มเหลว:", e);
  }

  process.exit(0);
}

setupSuperAdmin();
