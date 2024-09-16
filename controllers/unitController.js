import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createUnit = async (req, res) => {
  try {
    const { name, address, phoneNumber } = req.body;
    const unit = await prisma.unit.create({
      data: { name, address, phoneNumber }
    });
    res.status(201).json(unit);
  } catch (error) {
    res.status(500).json({ message: 'Error creating unit', error: error.message });
  }
};

const getUnits = async (req, res) => {
  try {
    const units = await prisma.unit.findMany();
    res.json(units);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching units', error: error.message });
  }
};

const deleteUnit = async (req, res) => {
  try {
    const unitId = parseInt(req.params.id);
    const unit = await prisma.unit.findUnique({ where: { id: unitId } });

    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    await prisma.unit.delete({ where: { id: unitId } });
    res.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting unit', error: error.message });
  }
};

const updateUnit = async (req, res) => {
  try {
    const unitId = parseInt(req.params.id);
    const { name, address, phoneNumber } = req.body;
    const updatedUnit = await prisma.unit.update({
      where: { id: unitId },
      data: { name, address, phoneNumber }
    });
    res.json(updatedUnit);
  } catch (error) {
    res.status(500).json({ message: 'Error updating unit', error: error.message });
  }
};

export { createUnit, getUnits, deleteUnit, updateUnit };
