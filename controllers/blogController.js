import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

const createSlug = (title) => {
  return slugify(title, { lower: true, strict: true });
};

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      include: { author: { select: { username: true } } }
    });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs', error: error.message });
  }
};

const createBlog = async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    const slug = createSlug(title);
    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        imageUrl,
        authorId: req.userId
      }
    });
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error creating blog', error: error.message });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { author: { select: { username: true } } }
    });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog', error: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blogId = parseInt(req.params.id);
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.authorId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    await prisma.blog.delete({ where: { id: blogId } });
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting blog', error: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const blogId = parseInt(req.params.id);
    const { title, content } = req.body;
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.authorId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }

    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: { title, content }
    });

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Error updating blog', error: error.message });
  }
};

export { getAllBlogs, createBlog, getBlogById, deleteBlog, updateBlog };