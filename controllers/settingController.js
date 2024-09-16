import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSettings = async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

export const updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    
    // ตรวจสอบว่าการตั้งค่านี้มีอยู่แล้วหรือไม่
    const existingSetting = await prisma.setting.findUnique({
      where: { key },
    });

    if (!existingSetting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    // อัปเดตการตั้งค่าที่มีอยู่
    const updatedSetting = await prisma.setting.update({
      where: { key },
      data: { value },
    });

    res.json(updatedSetting);
  } catch (error) {
    res.status(500).json({ message: 'Error updating setting', error: error.message });
  }
};
