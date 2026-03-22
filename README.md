# 🏫 SKR HUB: Smart Attendance System Workflow & Details

<div align="center">
  <img src="https://komarev.com/ghpvc/?username=your-username&color=3B82F6&style=flat-square&label=PROJECT+VIEWS" alt="Project Views" />
</div>

---

<div align="center">
  ## 💣 Infographic: System Overall Workflow & Architecture (ขั้นตอนการทำงานทั้งหมดและสถาปัตยกรรมระบบ)
</div>

<div align="center">
  <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4520-a447-11eb-908a-139a6edaec5c.gif" width="100%" alt="SKR HUB System Workflow & Architecture Visualization">
</div>

*This high-definition animated visualization ( image_4.png) breaks down the entire lifecycle of an attendance record and user interaction within the SKR Hub environment:*

### 1. **USER ROLES & ACCESS CONTROL (สิทธิ์ผู้ใช้งานและการเข้าถึง)**
*Visualizes the 4 distinct user levels, each with specific views and permissions:*
* **STUDENT (นักเรียน):** (Read-only view) See own stats, announcements.
* **HEAD STUDENT (หัวหน้าห้อง):** (Class-specific access) Check own class attendance, create classmate accounts.
* **ADMIN (ครู/ผู้ดูแล):** (School-wide view) Post announcements, set cutoff times, view all stats, manage users, request record edits.
* **SUPER ADMIN (ผู้บริหาร/ดูแลสูงสุด):** Full system access, approve edit requests, perform factory reset.

### 2. **DAILY WORKFLOW & DATA FLOW (ขั้นตอนการเช็คชื่อรายวันและการไหลของข้อมูล)**
*Illustrates the continuous data loop:*
* **Step 1: INPUT (Head Student):** Select classroom and date. A small calendar icon highlights the "Automatic Holiday Block" and a clock icon shows the "Time-Bounded Check."
* **Step 2: SUBMISSION & VALIDATION (Backend):** The cloud graphic represents **FIREBASE**. It shows **CLOUD FUNCTIONS** running logic and validations, securely connected to **FIREBASE AUTHENTICATION** and **CLOUD FIRESTORE** (Database).
* **Step 3: REAL-TIME UPDATES (Dashboard):** Data propagates instantly to the large **DASHBOARD** interface, where live statistical charts (Present Total, Late %, etc.) update immediately, and new posts appear in the **ANNOUNCEMENTS FEED**.
* **Step 4: REPORTING (Read-only Student View):** The final step shows the student viewing their personalized attendance report on their phone.

### 3. **ADVANCED FEATURES & SECURITY (ฟีเจอร์ขั้นสูงและความปลอดภัย)**
*Provides in-depth technical details on core features:*
* **DUAL-APPROVAL WORKFLOW (การอนุมัติสองขั้นตอน):** Visualizes the specific security logic for editing past attendance records. Shows Admin 1 making a change request (PENDING), Admin 2 reviewing and approving, resulting in a locked "FINAL RECORD" icon and a system log entry. *Label: "Ensures Data Integrity (รับประกันความถูกต้อง)".*
* **SYSTEM LOGS (บันทึกระบบ):** Shows an Admin viewing the "System Logs" with timestamped actions.
* **TECHNOLOGY STACK:** Icons for the core technologies: HTML, CSS, JavaScript, and Firebase (Auth, Firestore, Cloud Functions).
* **FACTORY RESET (การล้างข้อมูลระบบ):** Shows a Super Admin performing the factory reset action.

---

<div align="center">
  ## <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4520-a447-11eb-908a-139a6edaec5c.gif" width="35px"> Technical Features Highlight
</div>

* **📊 Real-time Dashboard:** Announcements appear instantly (Latency < 500ms) with a live statistics update feed ( image_4.png).
* **📝 Smart Attendance Check:** Validates classroom assignment, date, time-cutoff, weekends, and automatic holiday blocking on the backend before submission ( image_4.png).
* **🔐 Dual-Approval Workflow:** Past record edits require a submission from Admin 1 and an approval from a different Admin 2 to ensure data integrity and transparency ( image_4.png).
* **📈 Dynamic Analytics:** Statistics and percentage dashboards automatically filter data based on the user's role and classroom assignment ( image_4.png).
* **🕵️‍♂️ Intensive System Logs:** The backend automatically generates comprehensive, immutable system logs for auditing user activity.
* **💥 Factory Reset (The Nuclear Option):** A single-click factory reset feature allows the `super_admin` to clear all system data.

---

<div align="center">
  ## <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4520-a447-11eb-908a-139a6edaec5c.gif" width="35px"> Tech Stack Used
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
  <img src="https://img.shields.io/badge/SolidWorks-CC0000?style=for-the-badge&logo=solidworks&logoColor=white" alt="SolidWorks">
</p>

---

<div align="center">
  ## <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4520-a447-11eb-908a-139a6edaec5c.gif" width="35px"> Let's Connect (P oko56's P rofile)
</div>

<p align="center">
  <a href="https://github.com/poko56" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/github.svg" alt="poko56's GitHub" height="40" width="50" /></a>
  <a href="https://www.facebook.com/hiwmakmakkub" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/facebook.svg" alt="Facebook" height="40" width="50" /></a>
  <a href="https://www.instagram.com/pokomankrub/" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/instagram.svg" alt="Instagram" height="40" width="50" /></a>
</p></div>

<p align="center">
  <a href="https://github.com/poko56" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/github.svg" alt="poko56's GitHub" height="40" width="50" /></a>
  <a href="https://www.facebook.com/pkm.junior.39" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/facebook.svg" alt="Facebook" height="40" width="50" /></a>
  <a href="https://www.instagram.com/pokomankrub/" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/instagram.svg" alt="Instagram" height="40" width="50" /></a>
</p>
