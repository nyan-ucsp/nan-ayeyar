import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    const uploadPath = path.join(__dirname, '../../storage/uploads', year, month, day);
    
    // Create directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter for images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Image processing utility
export const processImage = async (
  inputPath: string,
  outputPath: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): Promise<void> => {
  const { width = 800, height = 600, quality = 80 } = options;

  await sharp(inputPath)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality })
    .toFile(outputPath);
};

// Generate thumbnail
export const generateThumbnail = async (
  inputPath: string,
  outputPath: string,
  size: number = 200
): Promise<void> => {
  await sharp(inputPath)
    .resize(size, size, {
      fit: 'cover',
    })
    .jpeg({ quality: 80 })
    .toFile(outputPath);
};
