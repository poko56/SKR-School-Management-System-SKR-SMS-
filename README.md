# 🏫 SKR Hub - Enterprise School Management System
**Sakonrajwittayanukul School (SKR) Management Platform**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-V9-FFCA28?logo=firebase&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Cloud_Functions-339933?logo=nodedotjs&logoColor=white)
![Architecture](https://img.shields.io/badge/Architecture-Serverless-ff69b4.svg)

**SKR Hub** คือแพลตฟอร์มบริหารจัดการสถานศึกษาแบบครบวงจร (School Management System) ที่ถูกออกแบบมาเพื่อทำ Digital Transformation ให้กับระบบการเช็คชื่อและจัดการข้อมูลของโรงเรียนสกลราชวิทยานุกูล ด้วยสถาปัตยกรรมแบบ Serverless บน Firebase แพลตฟอร์มนี้เน้นความปลอดภัยของข้อมูลสูงสุด (Data Integrity) การทำงานแบบเรียลไทม์ และระบบตรวจสอบย้อนหลังที่โปร่งใส

---

## 🏗️ System Architecture & Tech Stack

โปรเจกต์นี้ใช้สถาปัตยกรรมแบบ **Client-Serverless** เพื่อลดภาระการดูแลเซิร์ฟเวอร์ และรองรับการสเกล (Scalability) ในอนาคต
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ออกแบบโครงสร้างให้พร้อมต่อยอดไปใช้ Frameworks อย่าง React, Vue หรือ Angular ในอนาคต)
* **Backend:** Firebase Cloud Functions (Node.js) ทำหน้าที่เป็น API Gateway และ Business Logic Layer
* **Database:** Firebase Cloud Firestore (NoSQL) สำหรับข้อมูลที่ต้องการความรวดเร็วและ Real-time
* **Authentication:** Firebase Authentication ผสานระบบ Custom User Claims สำหรับจัดการสิทธิ์ (RBAC)

---

## 🌟 Core Modules & Detailed Features

### 1. 🔐 Role-Based Access Control (RBAC) & Authentication
ระบบจัดการสิทธิ์ผู้ใช้งานที่แบ่งออกเป็น 4 ระดับ โดยใช้ Firebase Custom Claims เพื่อฝังยศ (Role) ลงใน Token ป้องกันการปลอมแปลงสิทธิ์จากฝั่ง Client 100%
* **Super Admin (ผู้อำนวยการ):** มีอำนาจสูงสุด (Root Access) สามารถล้างข้อมูล (Factory Reset), สร้างบัญชี Admin, และ Override กฎเกณฑ์ทุกอย่างในระบบได้
* **Admin (ครูผู้ดูแล):** จัดการตั้งค่าเวลาเช็คชื่อ ประกาศวันหยุด และโพสต์ข่าวสารได้
* **Head Student (หัวหน้าห้อง):** ถูกล็อกสิทธิ์ให้ทำรายการ (เช็คชื่อ/สร้างบัญชีลูกบ้าน) ได้เฉพาะภายใน `room` ของตัวเองเท่านั้น
* **Student (นักเรียน):** Read-only Access ดูประกาศและสถิติของตนเอง

### 2. 📝 Smart Time-Bound Attendance System
ระบบเช็คชื่อที่ไม่ได้มีแค่การบันทึกข้อมูล แต่มี Business Logic ควบคุมเวลาอย่างเข้มงวด:
* **Time Synchronization:** หลังบ้านใช้เวลามาตรฐาน (BKK Time `UTC+7`) ป้องกันนักเรียนโกงเวลาจากเครื่อง Client
* **Cut-off Engine:** แอดมินสามารถกำหนดเวลาปิดรับเช็คชื่อรายวันได้ (เช่น 08:30 น.) หากเกินเวลา ระบบหลังบ้านจะปฏิเสธ Transaction ทันที
* **Holiday & Weekend Blocker:** ระบบตรวจจับวันหยุดสุดสัปดาห์ (เสาร์-อาทิตย์) และวันหยุดพิเศษที่แอดมินประกาศ เพื่อล็อกการเช็คชื่ออัตโนมัติ
* **Force Open (Override):** สวิตช์ฉุกเฉินสำหรับแอดมิน เพื่อเปิดการเช็คชื่อในวันหยุดเป็นกรณีพิเศษ

### 3. 🛡️ Dual-Approval Anti-Fraud Engine (ระบบอนุมัติ 2 ขั้นตอน)
เพื่อความโปร่งใสสูงสุดในการแก้ไขข้อมูลที่ถูกบันทึกไปแล้ว:
* หาก Admin ต้องการแก้ไขประวัติการเช็คชื่อย้อนหลัง ระบบจะไม่บันทึกลง Database ทันที
* ระบบจะสร้างเอกสารใน Collection `edit_requests` (สถานะ Pending)
* ต้องใช้บัญชี Admin ท่านอื่น หรือ Super Admin เข้ามากด `Approve` ระบบถึงจะทำ Trigger นำข้อมูลใหม่ไปเขียนทับข้อมูลเดิม

### 4. 🕵️‍♂️ Comprehensive System Audit Logs
ทุก Action ที่สำคัญในระบบจะถูกบันทึกลง `system_logs` โดยอัตโนมัติผ่าน Cloud Functions (Client ไม่มีสิทธิ์ยุ่งกับ Log):
* บันทึกข้อมูล: `Action Type`, `Description` (รวมถึงชื่อนักเรียนที่ถูกแก้ไขข้อมูลแบบรายบุคคล), `Actor` (อีเมลผู้กระทำ), และ `Timestamp`
* ประโยชน์: เพื่อทำ Audit Trail ป้องกันการแอบอ้าง หรือตรวจสอบหาผู้ที่ลบ/แก้ไขข้อมูลผิดพลาด

### 5. 📡 Real-time Announcement Feed
ระบบกระดานข่าวที่ใช้ `onSnapshot` Listener ของ Firestore ทันทีที่ Admin กดโพสต์ข้อความ ข้อมูลจะถูก Push ไปยัง Client ของนักเรียนทุกคนที่เปิดเว็บอยู่แบบ Real-time (Latency < 500ms)

---

## 🗄️ Database Schema (NoSQL Data Model)

โครงสร้าง Firestore ถูกออกแบบมาเพื่อลดการทำ Queries ที่ซ้ำซ้อน (Denormalization):

* **`users`**: เก็บข้อมูล Profile ของผู้ใช้งาน
    * `uid` (Document ID) -> `username`, `displayName`, `role`, `room`, `createdAt`
* **`attendance`**: เก็บข้อมูลการเช็คชื่อ (1 Document / 1 วัน / 1 ห้อง)
    * `{YYYY-MM-DD}_{Room}` (Document ID) -> `date`, `room`, `records: { uid: "present|late|absent|leave" }`, `recordedBy`, `updatedAt`
* **`settings`**: เก็บ Configuration ของระบบ
    * `attendance` -> `cutoffTime` (String)
    * `holidays` -> `{YYYY-MM-DD}: true`
    * `force_open` -> `{YYYY-MM-DD}: true`
* **`edit_requests`**: คำขอแก้ไขข้อมูล
    * `Auto-ID` -> `date`, `room`, `records` (New Data), `requestedBy`, `status`, `timestamp`
* **`announcements`**: กระดานข่าว
    * `Auto-ID` -> `content`, `author`, `timestamp`
* **`system_logs`**: บันทึกการทำงาน
    * `Auto-ID` -> `action`, `desc`, `actor`, `timestamp`

---

## 🔒 Security Posture (Firestore Rules)

ระบบนี้ใช้หลักการ **Zero Trust** จากฝั่ง Client:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // อนุญาตให้ผู้ใช้ในระบบอ่านข้อมูลได้เท่านั้น
      allow read: if request.auth != null;
      // ปิดประตูด้านหน้า 100% การเขียน/ลบ ทั้งหมดต้องผ่าน Backend (Cloud Functions)
      allow write: if false; 
    }
  }
}
