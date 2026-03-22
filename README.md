# 🏫 SKR HUB: ระบบบริหารจัดการการเช็คชื่ออัจฉริยะ (Smart Attendance System)

<div align="center">
  <img src="https://komarev.com/ghpvc/?username=poko56&color=3B82F6&style=flat-square&label=PROJECT+VIEWS" alt="Project Views" />
</div>

<div align="center">
  [![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=25&pause=1000&color=3B82F6&center=true&vCenter=false&width=600&lines=SOFTWARE+DEVELOPER;IOT+%26+HARDWARE+ENTHUSIAST;CREATIVE+VISUAL+DIRECTOR;COMPUTER+TECHNOLOGY+STUDENT+%40KMITL)](https://git.io/typing-svg)
</div>

---

<div align="center">
  ## 💣 อินโฟกราฟิก: โครงสร้างระบบทั้งหมด (Overall System Workflow)
</div>

<div align="center">
  <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4520-a447-11eb-908a-139a6edaec5c.gif" width="100%" alt="SKR HUB Overall System Workflow">
</div>

*ภาพอินโฟกราฟิกแบบ 3D Isometric ( image_2.png) นี้ อธิบายโครงสร้างระบบบริหารจัดการการเช็คชื่อทั้งหมด ( image_2.png) ของ SKR Hub ในมุมกว้าง โดยแบ่งเป็น 4 ส่วนหลัก:*

1.  **ROLE-BASED ACCESS CONTROL (RBAC):** แสดงยศผู้ใช้งานทั้ง 4 ระดับ (Super Admin, Admin, Head Student, Student) เชื่อมต่อกับสิทธิ์การเข้าถึงเมนูต่างๆ บน Dashboard อย่างชัดเจน
2.  **CURRENT DAY ATTENDANCE ( top loop):** อธิบาย **ระบบเช็คชื่อรายวัน** ที่ทำโดย Head Student โดยมีไอคอน "เวลาปิดรับ ( Time Cutoff - 08:30 น.)", "วันหยุดสุดสัปดาห์", และ "วันหยุดพิเศษ" กะพริบเพื่อล็อกการเช็คชื่อแบบอัตโนมัติ ( image_2.png) ข้อมูลจะผ่านการซิงค์เวลา BKK Time และบันทึกลง Firestore
3.  **EDITING PAST ATTENDANCE (DUAL-APPROVAL) ( bottom loop):** เน้นย้ำ **ระบบกุญแจ 2 ดอก ( Dual-Approval)** ( image_2.png) หาก Admin ต้องการแก้ข้อมูลเก่า ระบบจะสร้างเอกสารคำขอ (Edit Request) เพื่อให้อีก Admin ท่านอื่นมา Approve ก่อน ถึงจะอัปเดตฐานข้อมูลและ Log ได้ ( image_2.png)
4.  **REAL-TIME & DASHBOARD ANALYTICS:** แสดง Real-time Post Section ที่ Admin โพสต์ประกาศแล้วเด้งไปหน้า Student ทันทีแบบวินาทีต่อวินาที ( image_2.png) และ sub-module สถิติ ( Dynamic Stats) ที่แสดงผลแยกตามสิทธิ์

---

<div align="center">
  ## <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4520-a447-11eb-908a-139a6edaec5c.gif" width="35px"> ฟีเจอร์หลัก (Main Features)
</div>

* **📊 Real-time Dashboard:** กระดานข่าวสารอัจฉริยะ โพสต์ปุ๊บเด้งโชว์ปั๊บ Latency < 500ms ( image_2.png)
* **📝 Smart Attendance Check:** เช็คชื่อรายวันรายห้อง มีระบบล็อกเวลา (Cutoff Time) ล็อกวันเสาร์-อาทิตย์ และบล็อกวันหยุดอัตโนมัติ ( image_2.png)
* **🔐 Dual-Approval Workflow:** ระบบกุญแจ 2 ดอก หากต้องการแก้ไขข้อมูลย้อนหลัง แอดมินคนที่ 1 ต้องส่งคำขอให้แอดมินคนที่ 2 เป็นผู้อนุมัติเสมอ ( image_2.png) เพื่อความโปร่งใสสูงสุด
* **📈 Dynamic Analytics:** สถิติอัจฉริยะแสดงผลแยกตามสิทธิ์ ผู้อำนวยการเห็นทั้งโรงเรียน, หัวหน้าห้องเห็นเฉพาะห้องตัวเอง, นักเรียนเห็นเฉพาะสถิติตัวเอง ( image_2.png)
* **🕵️‍♂️ Intensive System Logs:** บันทึกประวัติการทำงานทุกฝีก้าวอย่างละเอียด ( System Logs) ใครทำอะไร แก้ไขข้อมูลใคร ตอนกี่โมง ระบบจดไว้หมด ( image_2.png)
* **💥 Factory Reset (ปุ่มนิวเคลียร์):** `super_admin` สามารถล้างข้อมูลทั้งระบบในคลิกเดียว ( image_2.png)

---

<div align="center">
  ## <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4520-a447-11eb-908a-139a6edaec5c.gif" width="35px"> เทคโนโลยีที่ใช้ (Tech Stack)
</div>

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <br>
  <img src="https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=firebase&logoColor=white" alt="Firebase Overall Stack">
  <img src="https://img.shields.io/badge/Firebase_Auth-039BE5?style=flat&logo=firebase&logoColor=white&labelColor=333" alt="Firebase Auth">
  <img src="https://img.shields.io/badge/Cloud_Firestore-FFCA28?style=flat&logo=firebase&logoColor=black" alt="Cloud Firestore">
  <img src="https://img.shields.io/badge/Cloud_Functions-339933?style=flat&logo=nodedotjs&logoColor=white" alt="Cloud Functions">
</p>

---

<div align="center">
  ## <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4520-a447-11eb-908a-139a6edaec5c.gif" width="35px"> Let's Connect ( p oko56's P rofile)
</div>

<p align="center">
  <a href="https://github.com/poko56" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/github.svg" alt="poko56's GitHub" height="40" width="50" /></a>
  <a href="https://www.facebook.com/pkm.junior.39" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/facebook.svg" alt="Facebook" height="40" width="50" /></a>
  <a href="https://www.instagram.com/pokomankrub/" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/instagram.svg" alt="Instagram" height="40" width="50" /></a>
</p>
