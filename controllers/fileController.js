import fs from 'fs';

const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.status(201).json({ 
    message: 'File uploaded successfully', 
    file: {
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype
    }
  });
};

const getFileList = (folder) => {
  return fs.readdirSync(folder).map(filename => ({
    name: filename,
    path: `${folder}/${filename}`
  }));
};

const getFiles = (req, res) => {
  const { type } = req.params;
  const allowedTypes = ['images', 'audio', 'video', 'documents'];
  
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ message: 'Invalid file type' });
  }

  const files = getFileList(`uploads/${type}`);
  res.json(files);
};

export { uploadFile, getFiles };
