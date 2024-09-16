import winston from 'winston';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class PrismaTransport extends winston.Transport {
  async log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    try {
      await prisma.log.create({
        data: {
          level: info.level,
          message: info.message,
          metadata: info.metadata || {}
        }
      });
    } catch (error) {
      console.error('Error saving log to database:', error);
    }

    callback();
  }
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new PrismaTransport()
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
