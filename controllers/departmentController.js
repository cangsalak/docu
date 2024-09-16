import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;
    const department = await prisma.department.create({
      data: { name }
    });
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error: error.message });
  }
};

const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const departmentId = parseInt(req.params.id);
    const department = await prisma.department.findUnique({ where: { id: departmentId } });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    await prisma.department.delete({ where: { id: departmentId } });
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting department', error: error.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const departmentId = parseInt(req.params.id);
    const { name } = req.body;
    const updatedDepartment = await prisma.department.update({
      where: { id: departmentId },
      data: { name }
    });
    res.json(updatedDepartment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating department', error: error.message });
  }
};

export { createDepartment, getDepartments, deleteDepartment, updateDepartment };
