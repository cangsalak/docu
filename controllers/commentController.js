import { PrismaClient } from '@prisma/client';
import { sendNotification } from '../services/notificationService.js';

const prisma = new PrismaClient();

const createComment = async (req, res) => {
  try {
    const { content, blogId } = req.body;
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.userId,
        blogId: parseInt(blogId)
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            address: true,
            phoneNumber: true,
            affiliation: true,
            rank: true,
            position: true,
            imageUrl: true
          }
        },
        blog: {
          select: {
            authorId: true
          }
        }
      }
    });

    // ส่งการแจ้งเตือนไปยังเจ้าของบล็อก
    sendNotification(comment.blog.authorId, `มีความคิดเห็นใหม่ในบล็อกของคุณ`);

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating comment', error: error.message });
  }
};

const getCommentsByBlogId = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { blogId: parseInt(req.params.blogId) },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            address: true,
            phoneNumber: true,
            affiliation: true,
            rank: true,
            position: true,
            imageUrl: true
          }
        }
      }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const comment = await prisma.comment.findUnique({ 
      where: { id: commentId },
      include: { author: true }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.authorId !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const { content } = req.body;
    const comment = await prisma.comment.findUnique({ 
      where: { id: commentId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            address: true,
            phoneNumber: true,
            affiliation: true,
            rank: true,
            position: true,
            imageUrl: true
          }
        }
      }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.authorId !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            address: true,
            phoneNumber: true,
            affiliation: true,
            rank: true,
            position: true,
            imageUrl: true
          }
        }
      }
    });

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error: error.message });
  }
};

export { createComment, getCommentsByBlogId, deleteComment, updateComment };