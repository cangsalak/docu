# คู่มือการใช้งานระบบจัดการเอกสาร

## การติดตั้ง
1. Clone repository
2. รัน `bun install` เพื่อติดตั้ง dependencies
3. สร้างไฟล์ `.env` และกำหนดค่า `DATABASE_URL` และ `JWT_SECRET`
4. รัน `bun prisma migrate dev` เพื่อสร้างฐานข้อมูล
5. รัน `bun run dev` เพื่อเริ่มต้นเซิร์ฟเวอร์

## API Endpoints

### การลงทะเบียนและเข้าสู่ระบบ
- POST /register: ลงทะเบียนผู้ใช้ใหม่
- POST /login: เข้าสู่ระบบ
- POST /logout: ออกจากระบบ

### การจัดการบล็อก
- GET /blogs: ดึงรายการบล็อกทั้งหมด
- POST /blogs: สร้างบล็อกใหม่ (ต้องเข้าสู่ระบบ)
- GET /blogs/:id: ดึงข้อมูลบล็อกตาม ID
- PUT /blogs/:id: อัปเด���ล็อก (ต้องเข้าสู่ระบบและเป็นเจ้าของบล็อก)

### การจัดการความคิดเห็น
- POST /blogs/:id/comments: สร้างความคิดเห็นใหม่ (ต้องเข้าสู่ระบบ)
- GET /blogs/:blogId/comments: ดึงรายการความคิดเห็นของบล็อก
- DELETE /comments/:id: ลบความคิดเห็น (ต้องเข้าสู่ระบบและเป็นเจ้าของความคิดเห็นหรือเป็น admin)
- PUT /comments/:id: อัปเดตความคิดเห็น (ต้องเข้าสู่ระบบและเป็นเจ้าของความคิดเห็นหรือเป็น admin)

### การจัดการเอกสาร
- POST /documents: อัปโหลดเอกสารใหม่ (ต้องเข้าสู่ระบบ)
- GET /documents: ดึงรายการเอกสารทั้งหมด (ต้องเข้าสู่ระบบ)
- GET /documents/:id: ดึงข้อมูลเอกสารตาม ID (ต้องเข้าสู่ระบบ)
- PUT /documents/:id: อัปเดตเ���กสาร (ต้องเข้าสู่ระบบและเป็นเจ้าของเอกสารหรือเป็น admin)
- GET /public-documents: ดึงรายการเอกสารสาธารณะ (ไม่ต้องเข้าสู่ระบบ)

### การจัดการหน่วยงาน
- POST /units: สร้างหน่วยงานใหม่ (ต้องเข้าสู่ระบบ)
- GET /units: ดึงรายการหน่วยงานทั้งหมด (ต้องเข้าสู่ระบบ)

### การจัดการแผนก
- POST /departments: สร้างแผนกใหม่ (ต้องเข้าสู่ระบบ)
- GET /departments: ดึงรายการแผนกทั้งหด (ต้องเข้าสู่ระบบ)
- PUT /departments/:id: อัปเดตแผนก (ต้องเข้าสู่ระบบ)
- PUT /units/:id: อัปเดตหน่วยงาน (ต้องเข้าสู่ระบบ)

### การจัดการการตั้งค่า
- GET /settings: ดึงการตั้งค่าทั้งหมด (ต้องเข้าสู่ระบบ)
- PUT /settings: อัปเดตการตั้งค่�� (ต้องเข้าสู่ระบบ)

## โครงสร้างข้อมูล

### เอกสาร (Document)
- title: ชื่อเอกสาร
- description: คำอธิบายเอกสาร
- documentType: ประเภทเอกสาร (INTERNAL, EXTERNAL, STAMPED, COMMAND, PUBLICITY, EVIDENCE)
- confidentiality: ระดับความลับ (GENERAL, CONFIDENTIAL, HIGHLY_CONFIDENTIAL, TOP_SECRET)
- documentNumber: เลขที่หนังสือ
- receivedDate: วันที่รับหนังสือ
- senderUnit: หน่วยงานผู้ส่ง
- receiverUnit: หน่วยงานผู้รับ
- department: แผนกที่เกี่ยวข้อง

### ผู้ใช้ (User)
- username: ชื่อผู้ใช้
- password: รหัสผ่าน
- role: บทบาท (ADMIN, STAFF)
- department: แผนกที่สังกัด
- address: ที่อยู่
- phoneNumber: เบอร์โทรศัพท์
- affiliation: สังกัด
- rank: ยศ
- position: ตำแหน่ง
- imageUrl: URL รูปภาพ
- email: อีเมล์ (ต้องเป็น @unique)

### หน่วยงาน (Unit)
- name: ชื่อหน่วยงาน
- address: ที่อยู่
- phoneNumber: เบอร์โทรศัพท์

### แผนก (Department)
- name: ชื่อแผนก

## การเข้าถึงเอกสารตามระดับความลับ
- GENERAL: เจ้าหน้าที่ทั่วไปสามารถเข้าถึงได้
- CONFIDENTIAL: เฉพาะสมาชิกในแผนกสามารถเข้าถึงได้
- HIGHLY_CONFIDENTIAL: เฉพาะหัวหน้าแผนกสามารถเข้าถึงได้
- TOP_SECRET: เฉพาะหัวหน้าแผนกสามารถเข้าถึงได้

<<<<<<< HEAD
### การจัดการหน้า (Pages)
- POST /pages: สร้างหน้าใหม่ (ต้องเข้าสู่ระบบ)
- GET /pages: ดึงรายการหน้าทั้งหมด
- GET /pages/:id: ดึงข้อมูลหน้าตาม ID
- PUT /pages/:id: อัปเดตหน้า (ต้องเข้าสู่ระบบ)
- DELETE /pages/:id: ลบหน้า (ต้องเข้าสู่ระบบ)

=======
>>>>>>> 7e79ae408be48a8485c53cad43b63050833cc1d0
## หมายเหตุ
- ทุก API endpoint ที่ต้องการการยืนยันตัวตนจะต้องส่ง token ในส่วนของ Authorization header
- การอัปโหลดไฟล์จะต้องใช้ form-data ในการส่งข้อมูล
