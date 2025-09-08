import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { Request } from 'express';

// File upload configuration
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    const uploadPath = path.join(process.cwd(), 'storage', 'uploads', year, month, day);
    
    // Create directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with UUID
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    
    cb(null, uniqueFilename);
  }
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check MIME type
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed.`));
  }
};

// Multer configuration
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10 // Maximum 10 files per request
  }
});

// File validation middleware
export const validateUploadedFile = (req: Request, res: any, next: any) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const file = req.file;
  
  // Additional validation
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    // Clean up uploaded file
    fs.unlinkSync(file.path);
    return res.status(400).json({
      success: false,
      message: `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed.`
    });
  }

  // Check file extension
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    // Clean up uploaded file
    fs.unlinkSync(file.path);
    return res.status(400).json({
      success: false,
      message: `Invalid file extension. Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed.`
    });
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    // Clean up uploaded file
    fs.unlinkSync(file.path);
    return res.status(400).json({
      success: false,
      message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
    });
  }

  next();
};

// Multiple file validation middleware
export const validateUploadedFiles = (req: Request, res: any, next: any) => {
  if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }

  const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
  
  for (const file of files) {
    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      // Clean up all uploaded files
      files.forEach(f => fs.unlinkSync(f.path));
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed.`
      });
    }

    // Check file extension
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      // Clean up all uploaded files
      files.forEach(f => fs.unlinkSync(f.path));
      return res.status(400).json({
        success: false,
        message: `Invalid file extension. Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed.`
      });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      // Clean up all uploaded files
      files.forEach(f => fs.unlinkSync(f.path));
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
      });
    }
  }

  next();
};

// Image processing utility
export const processImage = async (filePath: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}): Promise<string> => {
  const {
    width = 1200,
    height = 1200,
    quality = 85,
    format = 'jpeg'
  } = options || {};

  const outputPath = filePath.replace(path.extname(filePath), `_processed.${format}`);
  
  await sharp(filePath)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality })
    .toFile(outputPath);

  // Replace original with processed version
  fs.unlinkSync(filePath);
  fs.renameSync(outputPath, filePath);

  return filePath;
};

// Generate thumbnail utility
export const generateThumbnail = async (filePath: string, size: number = 300): Promise<string> => {
  const ext = path.extname(filePath);
  const thumbnailPath = filePath.replace(ext, `_thumb${ext}`);
  
  await sharp(filePath)
    .resize(size, size, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath);

  return thumbnailPath;
};

// Get relative storage path from absolute path
export const getRelativeStoragePath = (absolutePath: string): string => {
  const storageRoot = path.join(process.cwd(), 'storage', 'uploads');
  const relativePath = path.relative(storageRoot, absolutePath);
  return path.posix.join('/', 'uploads', relativePath.replace(/\\/g, '/'));
};

// Get absolute path from relative storage path
export const getAbsoluteStoragePath = (relativePath: string): string => {
  // Remove leading slash and normalize path
  const cleanPath = relativePath.replace(/^\/+/, '');
  return path.join(process.cwd(), 'storage', cleanPath);
};

// File deletion utility
export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    const absolutePath = filePath.startsWith('/') 
      ? getAbsoluteStoragePath(filePath)
      : path.join(process.cwd(), 'storage', filePath);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      
      // Also try to delete thumbnail if it exists
      const ext = path.extname(absolutePath);
      const thumbnailPath = absolutePath.replace(ext, `_thumb${ext}`);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Batch file deletion utility
export const deleteFiles = async (filePaths: string[]): Promise<{ deleted: string[], failed: string[] }> => {
  const deleted: string[] = [];
  const failed: string[] = [];

  for (const filePath of filePaths) {
    const success = await deleteFile(filePath);
    if (success) {
      deleted.push(filePath);
    } else {
      failed.push(filePath);
    }
  }

  return { deleted, failed };
};

// Sanitize filename utility
export const sanitizeFilename = (filename: string): string => {
  // Remove path traversal attempts
  const sanitized = filename
    .replace(/\.\./g, '') // Remove .. 
    .replace(/[\/\\]/g, '') // Remove path separators
    .replace(/[<>:"|?*]/g, '') // Remove invalid characters
    .trim();
  
  return sanitized || 'file';
};

// File info utility
export const getFileInfo = (filePath: string) => {
  const stats = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  
  return {
    size: stats.size,
    extension: ext,
    mimeType: getMimeType(ext),
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime
  };
};

// Get MIME type from extension
const getMimeType = (extension: string): string => {
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp'
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
};

// Upload response formatter
export const formatUploadResponse = (file: Express.Multer.File) => {
  const relativePath = getRelativeStoragePath(file.path);
  
  return {
    success: true,
    data: {
      filename: file.filename,
      originalName: file.originalname,
      path: relativePath,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date().toISOString()
    }
  };
};

// Multiple files upload response formatter
export const formatMultipleUploadResponse = (files: Express.Multer.File[]) => {
  const data = files.map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    path: getRelativeStoragePath(file.path),
    size: file.size,
    mimeType: file.mimetype,
    uploadedAt: new Date().toISOString()
  }));

  return {
    success: true,
    data: data,
    count: data.length
  };
};