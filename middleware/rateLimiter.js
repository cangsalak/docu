import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL);

const loginLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'login_attempt',
  points: 5, // จำนวนครั้งที่อนุญาตให้ล็อกอินผิดพลาด
  duration: 60 * 60, // ระยะเวลา 1 ชั่วโมง
  blockDuration: 60 * 60, // ระยะเวลาที่จะถูกระงับ (1 ชั่วโมง)
});

const loginMiddleware = async (req, res, next) => {
  const key = req.ip;
  try {
    await loginLimiter.consume(key);
    next();
  } catch (error) {
    if (error.consumedPoints > 10) {
      // ถ้าเกิน 10 ครั้ง ให้บล็อกถาวร
      await loginLimiter.block(key);
      res.status(403).json({ message: 'Account blocked. Please contact support.' });
    } else if (error.consumedPoints > 5) {
      // ถ้าเกิน 5 ครั้ง แต่ไม่เกิน 10 ครั้ง ให้ระงับชั่วคราว
      res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
    }
  }
};

export default loginMiddleware;
