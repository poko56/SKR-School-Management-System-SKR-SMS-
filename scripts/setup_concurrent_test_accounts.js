const admin = require("firebase-admin");

try {
  const serviceAccount = require("./serviceAccountKey.json");
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} catch (error) {
  console.error("❌ ไม่พบไฟล์ serviceAccountKey.json");
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();
const DOMAIN = "@school.local";
const DEFAULT_PASS = "password1234";

// สร้างบัญชีหัวหน้าห้อง 5 ห้อง + นักเรียน 1 คนต่อห้อง
const ROOMS = ["M5-1", "M5-2", "M5-3", "M5-4", "M5-5"];

async function setupAccounts() {
  for (const room of ROOMS) {
    const roomKey = room.replace("-", ""); // e.g. M51
    const headUser = `head_${roomKey.toLowerCase()}`; // e.g. head_m51
    const studentUser = `stu_${roomKey.toLowerCase()}`; // e.g. stu_m51

    const accounts = [
      { u: headUser, role: "head_student", room, name: `Head ${room}` },
      { u: studentUser, role: "student", room, name: `Student ${room}` },
    ];

    for (const acc of accounts) {
      const email = `${acc.u}${DOMAIN}`;
      console.log(`⏳ ${acc.u} (${acc.role}, ${room})...`);
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
        await auth.updateUser(userRecord.uid, { password: DEFAULT_PASS });
      } catch (error) {
        if (error.code === "auth/user-not-found") {
          userRecord = await auth.createUser({
            email,
            password: DEFAULT_PASS,
            displayName: acc.name,
          });
        } else {
          console.error("❌ Error:", error.message);
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
      console.log(`  ✅ ${acc.u}`);
    }
  }
  console.log(`\n🎉 สร้างบัญชีสำหรับทดสอบพร้อมกัน ${ROOMS.length} ห้องเสร็จสิ้น!`);
  process.exit(0);
}

setupAccounts();
