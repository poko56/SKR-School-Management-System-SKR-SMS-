# 🏫 SKR School Management System (SKR-SMS)

**SKR-SMS** คือเว็บแอปพลิเคชันบริหารจัดการสถานศึกษาแบบหลายหน้า (Multi-Page) ทำงานบนระบบ Firebase แบ่งสิทธิ์ผู้ใช้งาน 3 ระดับ (Super Admin, Admin, Student) สงวนสิทธิ์การสร้างบัญชีผู้ใช้ใหม่ให้เฉพาะ Super Admin เท่านั้น มาพร้อมกระดานประกาศข่าวสารส่วนกลางแบบ Real-time เพื่อการสื่อสารภายในโรงเรียนที่มีประสิทธิภาพและรวดเร็ว

---

## ✨ ฟีเจอร์หลัก (Features)

- **Role-Based Access Control:** ระบบจัดการสิทธิ์ 3 ระดับ
  - `Super Admin`: ควบคุมระบบทั้งหมด, จัดการผู้ใช้, สร้างประกาศ (เผยแพร่ทันที)
  - `Admin`: ดูภาพรวมระบบ, สร้างประกาศ (รอตรวจสอบ)
  - `Student`: รับชมประกาศและข่าวสาร
- **Exclusive User Management:** มีเพียง Super Admin เท่านั้นที่สามารถเพิ่มผู้ใช้ใหม่เข้าสู่ระบบได้
- **Smart Username Login:** เข้าสู่ระบบง่ายๆ ด้วย Username (ระบบจะจัดการแปลงเป็นอีเมลองค์กรเบื้องหลัง)
- **Real-time Announcement Feed:** กระดานข่าวสารอัปเดตแบบเรียลไทม์ผ่าน Firestore
- **Multi-Page Structure:** โครงสร้างเว็บไซต์แบบหลายหน้า แยกสัดส่วนการทำงานและเมนูต่างๆ ออกจากกันอย่างเป็นระเบียบและชัดเจน
- **Manual Token Verification:** ยืนยันตัวตนด้วย Token แบบยื่นเอง (Manual) ที่ฝั่ง Cloud Functions เพื่อความแม่นยำสูงสุด

---

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (Multi-Page Architecture)
- **Backend:** Firebase Cloud Functions (Node.js)
- **Database:** Cloud Firestore (NoSQL)
- **Authentication:** Firebase Authentication

---

## 🚀 การติดตั้งและการใช้งาน (Installation & Setup)

### สิ่งที่ต้องมีเบื้องต้น (Prerequisites)
1. ติดตั้ง [Node.js](https://nodejs.org/)
2. ติดตั้ง Firebase CLI (`npm install -g firebase-tools`)
3. มีโปรเจกต์บน [Firebase Console](https://console.firebase.google.com/) พร้อมเปิดใช้งาน Auth (Email/Password), Firestore และ Cloud Functions

### ขั้นตอนการติดตั้ง

1. **ตั้งค่าฝั่ง Frontend**
   นำค่า Config จาก Firebase Console ของคุณมาใส่ในไฟล์ HTML (เช่น `index.html` และหน้าอื่นๆ ที่มีการเรียกใช้ Firebase):
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "...",
       appId: "..."
   };
