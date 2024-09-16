import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { joinUserRoom } from '../services/notificationService.js';
import { sendEmail } from '../services/emailService.js';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

const redisClient = new Redis(process.env.REDIS_URL);

const loginLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'login_attempt',
  points: 5,
  duration: 60 * 60,
});

const register = async (req, res) => {
  try {
    const { username, password, address, phoneNumber, affiliation, rank, position, imageUrl, departmentId, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        address,
        phoneNumber,
        affiliation,
        rank,
        position,
        imageUrl,
        departmentId: parseInt(departmentId),
        email
      }
    });

    await sendEmail(
      email,
      'ยืนยันการลงทะเบียน',
      `ยินดีต้อนรับ ${username} เข้าสู่ระบบจัดการเอกสาร`,
      `<h1>ยินดีต้อนรับ ${username}</h1><p>คุณได้ลงทะเบียนเข้าสู่ระบบจัดการเอกสารเรียบร้อยแล้ว</p>`
    );

    logger.info(`User registered: ${username}`, { userId: user.id, email: user.email });
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`, { error });
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // รีเซ็ตตัวนับเมื่อล็อกอินสำเร็จ
    await loginLimiter.delete(req.ip);
    
    // เข้าร่วม room ของผู้ใช้
    joinUserRoom(req.app.get('io'), user.id);
    
    res.json({ token, userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

const updateUser = async (req, res) => {
  try {
    const { username, password, address, phoneNumber, affiliation, rank, position, imageUrl, departmentId } = req.body;
    const userId = req.userId;

    let updateData = {};
    if (username) {
      const existingUser = await prisma.user.findUnique({ where: { username } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      updateData.username = username;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }
    if (address) updateData.address = address;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (affiliation) updateData.affiliation = affiliation;
    if (rank) updateData.rank = rank;
    if (position) updateData.position = position;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (departmentId) updateData.departmentId = parseInt(departmentId);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.json({ message: 'User updated successfully', userId: updatedUser.id });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

export { register, login, logout, updateUser };