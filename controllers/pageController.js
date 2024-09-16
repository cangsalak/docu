import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createPage = async (req, res) => {
  try {
    const { title, content } = req.body;
    const newPage = await prisma.page.create({
      data: { title, content },
    });
    res.status(201).json(newPage);
  } catch (error) {
    res.status(500).json({ message: 'Error creating page', error: error.message });
  }
};

export const getPages = async (req, res) => {
  try {
    const pages = await prisma.page.findMany();
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pages', error: error.message });
  }
};

export const getPageById = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await prisma.page.findUnique({
      where: { id: Number(id) },
    });
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching page', error: error.message });
  }
};

export const updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const updatedPage = await prisma.page.update({
      where: { id: Number(id) },
      data: { title, content },
    });
    res.json(updatedPage);
  } catch (error) {
    res.status(500).json({ message: 'Error updating page', error: error.message });
  }
};

export const deletePage = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.page.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting page', error: error.message });
  }
};
