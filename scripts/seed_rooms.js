const admin = require("firebase-admin");

try {
  const serviceAccount = require("./serviceAccountKey.json");
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} catch (error) {
  console.error("❌ ไม่พบ serviceAccountKey.json"); process.exit(1);
}

const db = admin.firestore();

async function seedRooms() {
  const batch = db.batch();
  for (let i = 1; i <= 20; i++) {
    const roomId = `M5-${i}`;
    const ref = db.collection("rooms").doc(roomId);
    batch.set(ref, { name: roomId, grade: "M5", number: i, createdAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  }
  await batch.commit();
  console.log("🎉 สร้างห้อง M5-1 ถึง M5-20 ใน Firestore เสร็จแล้ว!");
  process.exit(0);
}

seedRooms();
