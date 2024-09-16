import express from 'express';
import multer from 'multer';
import path from 'path';
import { getData } from '../controllers/siteController.js';
import { register, login, logout, updateUser } from '../controllers/authController.js';
import { getAllBlogs, createBlog, getBlogById, deleteBlog, updateBlog } from '../controllers/blogController.js';
import { createComment, getCommentsByBlogId, deleteComment, updateComment } from '../controllers/commentController.js';
import authMiddleware from '../middleware/auth.js';
import { uploadFile, getFiles } from '../controllers/fileController.js';
import { uploadDocument, getDocuments, getDocumentById, deleteDocument, updateDocument, getPublicDocuments } from '../controllers/documentController.js';
import { createUnit, getUnits, deleteUnit, updateUnit } from '../controllers/unitController.js';
import { createDepartment, getDepartments, deleteDepartment, updateDepartment } from '../controllers/departmentController.js';
import { getSettings, updateSetting } from '../controllers/settingController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import loginMiddleware from '../middleware/rateLimiter.js';
import { createPage, getPages, getPageById, updatePage, deletePage } from '../controllers/pageController.js';

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fileFilter(req, file, (err, destination) => {
      if (err) {
        cb(err, null);
      } else {
        cb(null, destination);
      }
    });
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// ฟังก์ชันสำหรับตรวจสอบประภทไฟล์
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const allowedAudioTypes = ['audio/mpeg', 'audio/wav'];
  const allowedVideoTypes = ['video/mp4', 'video/mpeg'];
  const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];

  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, 'uploads/images');
  } else if (allowedAudioTypes.includes(file.mimetype)) {
    cb(null, 'uploads/audio');
  } else if (allowedVideoTypes.includes(file.mimetype)) {
    cb(null, 'uploads/video');
  } else if (allowedDocumentTypes.includes(file.mimetype)) {
    cb(null, 'uploads/documents');
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

/**
 * @swagger
 * /register:
 *   post:
 *     summary: ลงทะเบียนผู้ใช้ใหม่
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: ลงทะเบียนสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 */
router.post('/register', register);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: เข้าสู่ระบบ
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ
 *       401:
 *         description: การยืนยันตัวตนล้มเหลว
 */
router.post('/login', loginMiddleware, login);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: ออกจากระบบ
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ออกจากระบบสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 */
router.post('/logout', authMiddleware, logout);

/**
 * @swagger
 * /update-user:
 *   put:
 *     summary: อัปเดตข้อมูลผู้ใช้
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               address:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               affiliation:
 *                 type: string
 *               rank:
 *                 type: string
 *               position:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               departmentId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: อัปเดตข้อมูลผู้ใช้สำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       500:
 *         description: เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้
 */
router.put('/update-user', authMiddleware, updateUser);

/**
 * @swagger
 * /blogs:
 *   get:
 *     summary: ดึงรายการบล็อกทั้งหมด
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: รายการบล็อกทั้งหมด
 *   post:
 *     summary: สร้างบล็อกใหม่
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: สร้างบล็อกสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 */
router.get('/blogs', getAllBlogs);
router.post('/blogs', authMiddleware, upload.single('image'), createBlog);

/**
 * @swagger
 * /blogs/{id}:
 *   get:
 *     summary: ดึงข้อมูลบล็อกตาม ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ข้อมูลบล็อก
 *       404:
 *         description: ไม่พบบล็อก
 *   put:
 *     summary: อัปเดตบล็อก
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: อัปเดตบล็อกสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์อัปเดตบล็อกนี้
 *       404:
 *         description: ไม่พบบล็อก
 */
router.get('/blogs/:id', getBlogById);
router.put('/blogs/:id', authMiddleware, updateBlog);

/**
 * @swagger
 * /blogs/{id}/comments:
 *   post:
 *     summary: สร้างความคิดเห็นใหม่
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: สร้างความคิดเห็นสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *   get:
 *     summary: ดึงรายการความคิดเห็นของบล็อก
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: รายการความคิดเห็น
 */
router.post('/blogs/:id/comments', authMiddleware, createComment);
router.get('/blogs/:blogId/comments', getCommentsByBlogId);

/**
 * @swagger
 * /documents:
 *   post:
 *     summary: อัปโหลดเอกสารใหม่
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               documentType:
 *                 type: string
 *                 enum: [INTERNAL, EXTERNAL, STAMPED, COMMAND, PUBLICITY, EVIDENCE]
 *               confidentiality:
 *                 type: string
 *                 enum: [GENERAL, CONFIDENTIAL, HIGHLY_CONFIDENTIAL, TOP_SECRET]
 *               documentNumber:
 *                 type: string
 *               receivedDate:
 *                 type: string
 *                 format: date
 *               senderUnitId:
 *                 type: integer
 *               receiverUnitId:
 *                 type: integer
 *               departmentId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: อัปโหลดเอกสารสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์อัปโหลดเอกสารประเภทนี้
 *   get:
 *     summary: ดึงรายการเอกสารตามสิทธิ์การเข้าถึง
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการเอกสารที่มีสิทธิ์เข้าถึง
 *       401:
 *         description: ไม่ได้รับอนุญาต
 */
router.post('/documents', authMiddleware, upload.single('file'), uploadDocument);
router.get('/documents', authMiddleware, getDocuments);

/**
 * @swagger
 * /documents/{id}:
 *   get:
 *     summary: ดึงข้อมูลเอกสารตาม ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ข้อมูลเอกสาร
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึงเอกสารนี้
 *       404:
 *         description: ไม่พบเอกสาร
 *   put:
 *     summary: อัปเดตเอกสาร
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               documentType:
 *                 type: string
 *                 enum: [INTERNAL, EXTERNAL, STAMPED, COMMAND, PUBLICITY, EVIDENCE]
 *               confidentiality:
 *                 type: string
 *                 enum: [GENERAL, CONFIDENTIAL, HIGHLY_CONFIDENTIAL, TOP_SECRET]
 *               documentNumber:
 *                 type: string
 *               receivedDate:
 *                 type: string
 *                 format: date
 *               senderUnitId:
 *                 type: integer
 *               receiverUnitId:
 *                 type: integer
 *               departmentId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: อัปเดตเอกสารสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์อัปเดตเอกสารนี้
 *       404:
 *         description: ไม่พบเอกสาร
 */
router.get('/documents/:id', authMiddleware, getDocumentById);
router.put('/documents/:id', authMiddleware, updateDocument);

/**
 * @swagger
 * /units:
 *   post:
 *     summary: สร้างหน่วยงานใหม่
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: สร้างหน่วยงานสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *   get:
 *     summary: ดึงรายการหน่วยงานทั้งหมด
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการหน่วยงาน
 *       401:
 *         description: ไม่ได้รับอนุญาต
 */
router.post('/units', authMiddleware, createUnit);
router.get('/units', authMiddleware, getUnits);

/**
 * @swagger
 * /departments:
 *   post:
 *     summary: สร้างแผนกใหม่
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: สร้างแผนกสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *   get:
 *     summary: ดึงรายการแนกทั้งหมด
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการแผนก
 *       401:
 *         description: ไม่ได้รับอนุญาต
 */
router.post('/departments', authMiddleware, createDepartment);
router.get('/departments', authMiddleware, getDepartments);

router.get('/', getData);

router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', userId: req.userId });
});

router.post('/upload', authMiddleware, upload.single('file'), uploadFile);
router.get('/files/:type', getFiles);

const getFileList = (folder) => {
  return fs.readdirSync(folder).map(filename => ({
    name: filename,
    path: `${folder}/${filename}`
  }));
};

/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     summary: ลบบล็อก
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ลบบล็อกสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์ลบบล็อกนี้
 *       404:
 *         description: ไม่พบบล็อก
 */
router.delete('/blogs/:id', authMiddleware, deleteBlog);

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: ลบเอกสาร
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ลบเอกสารสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์ลบเอกสารนี้
 *       404:
 *         description: ไม่พบเอกสาร
 */
router.delete('/documents/:id', authMiddleware, deleteDocument);

/**
 * @swagger
 * /units/{id}:
 *   delete:
 *     summary: ลบหน่วยงาน
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ลบหน่วยงานสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบหน่วยงาน
 */
router.delete('/units/:id', authMiddleware, deleteUnit);

/**
 * @swagger
 * /departments/{id}:
 *   delete:
 *     summary: ลบแผนก
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ลบแผนกสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบแผนก
 */
router.delete('/departments/:id', authMiddleware, deleteDepartment);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: ลบความคิดเห็น
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ลบความคิดเห็นสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์ลบความคิดเห็นนี้
 *       404:
 *         description: ไม่พบความคิดเห็น
 */
router.delete('/comments/:id', authMiddleware, deleteComment);

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: อัปเดตความคิดเห็น
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: อัปเดตความคิดเห็นสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์อัปเดตความคิดเห็นนี้
 *       404:
 *         description: ไม่พบความคิดเห็น
 */
router.put('/comments/:id', authMiddleware, updateComment);

/**
 * @swagger
 * /units/{id}:
 *   put:
 *     summary: อัปเดตหน่วยงาน
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: อัปเดตหน่วยงานสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบหน่วยงาน
 */
router.put('/units/:id', authMiddleware, updateUnit);

/**
 * @swagger
 * /departments/{id}:
 *   put:
 *     summary: อัปเดตแผนก
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: อัปเดตแผนกสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบแผนก
 */
router.put('/departments/:id', authMiddleware, updateDepartment);

/**
 * @swagger
 * /public-documents:
 *   get:
 *     summary: ดึงรายการเอกสารสาธารณะ
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: รายการเอกสารสาธารณะ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   documentType:
 *                     type: string
 *                   documentNumber:
 *                     type: string
 *                   receivedDate:
 *                     type: string
 *                     format: date
 */
router.get('/public-documents', getPublicDocuments);

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: ดึงการตั้งค่าทั้งหมด
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   key:
 *                     type: string
 *                   value:
 *                     type: string
 */

/**
 * @swagger
 * /settings/{key}:
 *   put:
 *     summary: อัปเดตการตั้งค่า
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: อัปเดตสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 *                 value:
 *                   type: string
 *       404:
 *         description: ไม่พบการตั้งค่า
 */

router.get('/settings', authMiddleware, getSettings);
router.put('/settings/:key', authMiddleware, updateSetting);

/**
 * @swagger
 * /pages:
 *   post:
 *     summary: สร้างหน้าใหม่
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: สร้างหน้าสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *   get:
 *     summary: ดึงรายการหน้าทั้งหมด
 *     tags: [Pages]
 *     responses:
 *       200:
 *         description: รายการหน้าทั้งหมด
 */
router.post('/pages', authMiddleware, createPage);
router.get('/pages', getPages);

/**
 * @swagger
 * /pages/{id}:
 *   get:
 *     summary: ดึงข้อมูลหน้าตาม ID
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ข้อมูลหน้า
 *       404:
 *         description: ไม่พบหน้า
 *   put:
 *     summary: อัปเดตหน้า
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: อัปเดตหน้าสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบหน้า
 *   delete:
 *     summary: ลบหน้า
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ลบหน้าสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบหน้า
 */

/**
 * @swagger
 * /pages:
 *   post:
 *     summary: สร้างหน้าใหม่
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: สร้างหน้าสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *   get:
 *     summary: ดึงรายการหน้าทั้งหมด
 *     tags: [Pages]
 *     responses:
 *       200:
 *         description: รายการหน้าทั้งหมด
 */
router.post('/pages', authMiddleware, createPage);
router.get('/pages', getPages);

/**
 * @swagger
 * /pages/{id}:
 *   get:
 *     summary: ดึงข้อมูลหน้าตาม ID
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ข้อมูลหน้า
 *       404:
 *         description: ไม่พบหน้า
 *   put:
 *     summary: อัปเดตหน้า
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: อัปเดตหน้าสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบหน้า
 *   delete:
 *     summary: ลบหน้า
 *     tags: [Pages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ลบหน้าสำเร็จ
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       404:
 *         description: ไม่พบหน้า
 */
router.get('/pages/:id', getPageById);
router.put('/pages/:id', authMiddleware, updatePage);
router.delete('/pages/:id', authMiddleware, deletePage);

export default router;