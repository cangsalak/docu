import { PrismaClient } from '@prisma/client';
import { defaultSettings } from '../config/defaultSettings.js';

const prisma = new PrismaClient();

async function seedSettings() {
  for (const setting of defaultSettings) {
    const existingSetting = await prisma.setting.findUnique({
      where: { key: setting.key },
    });
    if (!existingSetting) {
      await prisma.setting.create({
        data: setting,
      });
      console.log(`Created setting: ${setting.key}`);
    } else {
      console.log(`Setting already exists: ${setting.key}`);
    }
  }
  console.log('Default settings seeded successfully');
}

seedSettings()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
