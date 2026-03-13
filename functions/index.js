const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const DOMAIN = "@school.local";

/**
 * บันทึกประวัติการทำงานของระบบ (System Log)
 * @param {string} act - ชื่อ Action (เช่น CREATE_USER, HOLIDAY)
 * @param {string} desc - รายละเอียดการกระทำ
 * @param {string} actor - อีเมลของผู้กระทำ
 * @return {Promise<void>}
 */
async function writeLog(act, desc, actor) {
  try {
    await db.collection("system_logs").add({
      action: act,
      desc: desc,
      actor: actor,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.error("Log error", e);
  }
}

exports.createUserWithRole = functions.https.onCall(async (req) => {
  const payload = req.data || {};
  const manToken = payload.token;
  const autoToken = req.auth ? req.auth.token : null;
  if (!manToken && !autoToken) {
    throw new functions.https.HttpsError("unauthenticated", "No Token");
  }

  let role = "user"; let uid = ""; let email = "unknown";
  try {
    if (manToken) {
      const dec = await admin.auth().verifyIdToken(manToken);
      role = dec.role || "user";
      uid = dec.uid;
      email = dec.email;
    } else if (autoToken) {
      role = req.auth.token.role || "user";
      uid = req.auth.uid;
      email = req.auth.token.email;
    }
  } catch (e) {
    throw new functions.https.HttpsError("unauthenticated", "Invalid");
  }

  let cRoom = null;
  if (role === "head_student") {
    const doc = await db.collection("users").doc(uid).get();
    if (doc.exists) cRoom = doc.data().room;
  }

  const {username, password, displayName, targetRole, room} = payload;
  let finalRoom = room || "None";

  if (role === "super_admin") {
    // ok - Super Admin สร้างใครก็ได้
  } else if (role === "admin") {
    if (targetRole === "admin" || targetRole === "super_admin") {
      throw new functions.https.HttpsError(
          "permission-denied",
          "เฉพาะ Super Admin ที่สามารถสร้างบัญชี Admin ได้",
      );
    }
    // Admin สร้าง Student และ Head Student ได้
  } else if (role === "head_student") {
    if (targetRole !== "student") {
      throw new functions.https.HttpsError(
          "permission-denied",
          "ผิดสิทธิ์",
      );
    }
    if (!cRoom) {
      throw new functions.https.HttpsError(
          "failed-precondition",
          "ไม่พบห้อง",
      );
    }
    finalRoom = cRoom;
  } else {
    throw new functions.https.HttpsError(
        "permission-denied",
        "ไม่มีสิทธิ์",
    );
  }

  const newEmail = `${username.trim()}${DOMAIN}`;
  try {
    const userRec = await admin.auth().createUser({
      email: newEmail,
      password: password,
      displayName: displayName || username,
    });
    await admin.auth().setCustomUserClaims(userRec.uid, {
      role: targetRole,
      room: finalRoom,
    });
    await db.collection("users").doc(userRec.uid).set({
      username: username.trim(),
      displayName: displayName || username,
      role: targetRole,
      room: finalRoom,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await writeLog("CREATE_USER", `สร้างผู้ใช้ ${username}`, email);
    return {success: true, message: `สร้าง ${username} สำเร็จ!`};
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

exports.updateAttendanceSettings = functions.https.onCall(async (req) => {
  const role = req.auth ? req.auth.token.role : null;
  const email = req.auth ? req.auth.token.email : "unknown";
  if (role !== "super_admin" && role !== "admin") {
    throw new functions.https.HttpsError(
        "permission-denied",
        "แอดมินเท่านั้น",
    );
  }
  const {cutoffTime} = req.data || {};
  await db.collection("settings").doc("attendance").set({
    cutoffTime: cutoffTime,
  }, {merge: true});

  await writeLog("SETTING", `ตั้งเวลาปิดรับเช็คชื่อ ${cutoffTime}`, email);
  return {success: true};
});

exports.submitAttendance = functions.https.onCall(async (req) => {
  const role = req.auth ? req.auth.token.role : null;
  const email = req.auth ? req.auth.token.email : "unknown";
  if (!["super_admin", "admin", "head_student"].includes(role)) {
    throw new functions.https.HttpsError("permission-denied", "ไม่มีสิทธิ์");
  }

  const {date, room, records, isOverride} = req.data || {};

  // ป้องกัน Head Student แฮกข้ามห้อง (Inspect Element)
  if (role === "head_student" && room !== req.auth.token.room) {
    throw new functions.https.HttpsError(
        "permission-denied",
        "ไม่มีสิทธิ์เช็คชื่อข้ามห้องตัวเอง!",
    );
  }

  const holDoc = await db.collection("settings").doc("holidays").get();
  if (holDoc.exists && holDoc.data()[date] === true) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "วันนี้ประกาศเป็นวันหยุดงดเช็คชื่อ",
    );
  }

  const offset = 7 * 60 * 60 * 1000;
  const bkkTime = new Date(new Date().getTime() + offset);

  // แปลง string 'YYYY-MM-DD' ให้เป็น Date Obj เพื่อหาวันในสัปดาห์
  const checkDateObj = new Date(date);
  const dayOfWeek = checkDateObj.getDay(); // 0 = Sunday, 6 = Saturday
  if ((dayOfWeek === 0 || dayOfWeek === 6) && !isOverride) {
    throw new functions.https.HttpsError(
        "failed-precondition",
        "วันนี้เป็นวันหยุดสุดสัปดาห์",
    );
  }

  const todayStr = bkkTime.toISOString().split("T")[0];

  if (role === "head_student" && date !== todayStr) {
    throw new functions.https.HttpsError("invalid-argument", "ผิดวัน!");
  }

  if (role === "head_student" && date === todayStr) {
    const setDoc = await db.collection("settings").doc("attendance").get();
    if (setDoc.exists && setDoc.data().cutoffTime) {
      const cutStr = setDoc.data().cutoffTime;
      const [cutH, cutM] = cutStr.split(":").map(Number);
      const cH = bkkTime.getUTCHours();
      const cM = bkkTime.getUTCMinutes();
      if ((cH * 60) + cM > (cutH * 60) + cutM) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "หมดเวลา",
        );
      }
    }
  }

  const docId = `${date}_${room}`;
  await db.collection("attendance").doc(docId).set({
    date,
    room,
    records,
    recordedBy: email,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, {merge: true});

  await writeLog("ATTENDANCE", `บันทึกเช็คชื่อห้อง ${room}`, email);
  return {success: true, message: `บันทึกห้อง ${room} สำเร็จ!`};
});

exports.postAnnouncement = functions.https.onCall(async (req) => {
  const role = req.auth ? req.auth.token.role : null;
  const email = req.auth ? req.auth.token.email : "Admin";
  if (role !== "super_admin" && role !== "admin") {
    throw new functions.https.HttpsError(
        "permission-denied",
        "แอดมินเท่านั้น",
    );
  }
  const {content} = req.data || {};
  if (!content || content.trim() === "") {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "พิมพ์ข้อความ",
    );
  }
  await db.collection("announcements").add({
    content: content.trim(),
    author: email,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  await writeLog("POST", `โพสต์ประกาศข่าวใหม่`, email);
  return {success: true, message: "โพสต์ประกาศสำเร็จ!"};
});

exports.setHoliday = functions.https.onCall(async (req) => {
  const role = req.auth ? req.auth.token.role : null;
  const email = req.auth ? req.auth.token.email : "unknown";
  if (role !== "super_admin" && role !== "admin") {
    throw new functions.https.HttpsError(
        "permission-denied",
        "แอดมินเท่านั้น",
    );
  }
  const {date, isHoliday} = req.data || {};
  const docRef = db.collection("settings").doc("holidays");

  if (isHoliday) {
    await docRef.set({[date]: true}, {merge: true});
    await writeLog("HOLIDAY", `ประกาศวันหยุดวันที่: ${date}`, email);
  } else {
    const del = admin.firestore.FieldValue.delete();
    await docRef.set({[date]: del}, {merge: true});
    await writeLog("HOLIDAY", `ยกเลิกวันหยุดวันที่: ${date}`, email);
  }
  return {success: true};
});


exports.requestEditAttendance = functions.https.onCall(async (req) => {
  const role = req.auth ? req.auth.token.role : null;
  const email = req.auth ? req.auth.token.email : "unknown";
  if (role !== "super_admin" && role !== "admin") {
    throw new functions.https.HttpsError(
        "permission-denied",
        "แอดมินเท่านั้น",
    );
  }
  const {date, room, records} = req.data || {};
  await db.collection("edit_requests").add({
    date,
    room,
    records,
    requestedBy: email,
    status: "pending",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  // พยายามหาชื่อนักเรียนจาก UID ใน records เพื่อให้ Log ละเอียดขึ้น
  const userIds = Object.keys(records);
  let detailStr = "";
  if (userIds.length > 0) {
    try {
      const uDoc = await db.collection("users").doc(userIds[0]).get();
      if (uDoc.exists) {
        const displayName = uDoc.data().displayName || uDoc.data().username;
        detailStr = ` (เช่น แก้ไข: ${displayName})`;
      }
    } catch (e) {
      console.error(e);
    }
  }

  await writeLog(
      "REQ_EDIT",
      `ขอแก้ข้อมูลห้อง ${room} (${date})${detailStr}`,
      email,
  );
  return {success: true};
});

exports.approveEditAttendance = functions.https.onCall(async (req) => {
  const role = req.auth ? req.auth.token.role : null;
  const email = req.auth ? req.auth.token.email : "unknown";
  if (role !== "super_admin" && role !== "admin") {
    throw new functions.https.HttpsError(
        "permission-denied",
        "แอดมินเท่านั้น",
    );
  }
  const {reqId} = req.data || {};
  const reqRef = db.collection("edit_requests").doc(reqId);
  const reqDoc = await reqRef.get();

  if (!reqDoc.exists || reqDoc.data().status !== "pending") {
    throw new functions.https.HttpsError("not-found", "ไม่พบคำขอ");
  }

  const data = reqDoc.data();
  if (data.requestedBy === email && role !== "super_admin") {
    throw new functions.https.HttpsError(
        "permission-denied",
        "ให้อีกท่านอนุมัติ",
    );
  }

  const docId = `${data.date}_${data.room}`;
  await db.collection("attendance").doc(docId).set({
    date: data.date,
    room: data.room,
    records: data.records,
    recordedBy: data.requestedBy,
    approvedBy: email,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, {merge: true});

  await reqRef.update({status: "approved", approvedBy: email});
  await writeLog("APPROVE_EDIT", `อนุมัติแก้ไขห้อง ${data.room}`, email);
  return {success: true};
});

exports.factoryReset = functions.https.onCall(async (req) => {
  const role = req.auth ? req.auth.token.role : null;
  const email = req.auth ? req.auth.token.email : "unknown";

  if (role !== "super_admin") {
    throw new functions.https.HttpsError(
        "permission-denied",
        "เฉพาะผู้อำนวยการ (Super Admin) เท่านั้น",
    );
  }

  // ลบข้อมูลบาง Collection เพื่อรีเซ็ตระบบ
  const collectionsToDelete = [
    "attendance",
    "announcements",
    "system_logs",
    "edit_requests",
  ];

  for (const colName of collectionsToDelete) {
    const snapshot = await db.collection(colName).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  await writeLog("FACTORY_RESET", `รีเซ็ตล้างข้อมูลทั้งระบบ`, email);
  return {success: true, message: "Factory Reset สมบูรณ์"};
});
