import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const {
      title,
      description,
      documentType,
      confidentiality,
      documentNumber,
      receivedDate,
      senderUnitId,
      receiverUnitId,
      departmentId
    } = req.body;

    if (documentType === 'PUBLICITY' && confidentiality !== 'GENERAL') {
      return res.status(400).json({ message: 'Public documents must have GENERAL confidentiality' });
    }

    const document = await prisma.document.create({
      data: {
        title,
        description,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        documentType,
        confidentiality,
        documentNumber,
        receivedDate: new Date(receivedDate),
        senderUnitId: parseInt(senderUnitId),
        receiverUnitId: parseInt(receiverUnitId),
        userId: req.userId,
        departmentId: parseInt(departmentId)
      }
    });
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
};

const getDocuments = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { department: true }
    });

    let documents;
    if (user.role === 'GENERAL' || user.role === 'USER') {
      documents = await prisma.document.findMany({
        where: { 
          confidentiality: 'GENERAL',
          documentType: 'PUBLICITY'
        }
      });
    } else if (user.role === 'STAFF') {
      documents = await prisma.document.findMany({
        where: {
          confidentiality: { in: ['GENERAL', 'CONFIDENTIAL'] },
          departmentId: user.departmentId
        }
      });
    } else if (['DEPUTY_DEPARTMENT_HEAD', 'DEPARTMENT_HEAD'].includes(user.role)) {
      documents = await prisma.document.findMany({
        where: { departmentId: user.departmentId }
      });
    } else if (['ASSISTANT_DIRECTOR', 'DEPUTY_DIRECTOR', 'DIRECTOR'].includes(user.role)) {
      documents = await prisma.document.findMany();
    }

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        uploadedBy: { select: { username: true } },
        senderUnit: true,
        receiverUnit: true,
        department: true
      }
    });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { department: true }
    });

    if (document.confidentiality === 'GENERAL' || 
        ['ASSISTANT_DIRECTOR', 'DEPUTY_DIRECTOR', 'DIRECTOR'].includes(user.role) ||
        (user.role === 'DEPARTMENT_HEAD' && user.departmentId === document.departmentId) ||
        (user.role === 'DEPUTY_DEPARTMENT_HEAD' && user.departmentId === document.departmentId) ||
        (user.role === 'STAFF' && user.departmentId === document.departmentId && document.confidentiality !== 'TOP_SECRET')) {
      res.json(document);
    } else {
      return res.status(403).json({ message: 'Not authorized to view this document' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document', error: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const document = await prisma.document.findUnique({ where: { id: documentId } });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { department: true }
    });

    if (['ASSISTANT_DIRECTOR', 'DEPUTY_DIRECTOR', 'DIRECTOR'].includes(user.role) ||
        (user.role === 'DEPARTMENT_HEAD' && user.departmentId === document.departmentId) ||
        (user.role === 'DEPUTY_DEPARTMENT_HEAD' && user.departmentId === document.departmentId && document.confidentiality !== 'TOP_SECRET')) {
      await prisma.document.delete({ where: { id: documentId } });
      res.json({ message: 'Document deleted successfully' });
    } else {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
};

const updateDocument = async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const { title, description, documentType, confidentiality, documentNumber, receivedDate, senderUnitId, receiverUnitId, departmentId } = req.body;

    const document = await prisma.document.findUnique({ where: { id: documentId } });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { department: true }
    });

    if (['ASSISTANT_DIRECTOR', 'DEPUTY_DIRECTOR', 'DIRECTOR'].includes(user.role) ||
        (user.role === 'DEPARTMENT_HEAD' && user.departmentId === document.departmentId) ||
        (user.role === 'DEPUTY_DEPARTMENT_HEAD' && user.departmentId === document.departmentId && document.confidentiality !== 'TOP_SECRET')) {
      if (!title || !documentType || !confidentiality) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const updatedDocument = await prisma.document.update({
        where: { id: documentId },
        data: {
          title,
          description,
          documentType,
          confidentiality,
          documentNumber,
          receivedDate: new Date(receivedDate),
          senderUnitId: parseInt(senderUnitId),
          receiverUnitId: parseInt(receiverUnitId),
          departmentId: parseInt(departmentId)
        }
      });

      res.json(updatedDocument);
    } else {
      return res.status(403).json({ message: 'Not authorized to update this document' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating document', error: error.message });
  }
};

const getPublicDocuments = async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { 
        confidentiality: 'GENERAL',
        documentType: 'PUBLICITY'
      },
      select: {
        id: true,
        title: true,
        description: true,
        documentNumber: true,
        receivedDate: true,
        senderUnit: { select: { name: true } },
        receiverUnit: { select: { name: true } },
        department: { select: { name: true } }
      }
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching public documents', error: error.message });
  }
};

export { uploadDocument, getDocuments, getDocumentById, deleteDocument, updateDocument, getPublicDocuments };
