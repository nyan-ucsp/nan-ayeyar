import express from 'express';
import { upload, processImage, generateThumbnail } from '../utils/upload';
import { authenticate } from '../middleware/auth';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();
// Shared handler to process a single uploaded file (first file found)
const handleSingleFile = async (file: Express.Multer.File, baseUrl: string) => {
  const originalPath = file.path;
  const filename = file.filename;
  const baseName = path.parse(filename).name;
  const ext = path.parse(filename).ext;

  // Process main image (smaller defaults for generic uploads)
  const processedPath = path.join(path.dirname(originalPath), `${baseName}_processed${ext}`);
  await processImage(originalPath, processedPath, {
    width: 800,
    height: 600,
    quality: 80
  });

  // Generate thumbnail
  const thumbnailPath = path.join(path.dirname(originalPath), `${baseName}_thumb${ext}`);
  await generateThumbnail(originalPath, thumbnailPath, 200);

  // Delete original file
  await fs.unlink(originalPath);

  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  return {
    filename,
    url: `${baseUrl}/uploads/${year}/${month}/${day}/${filename}`,
    processedUrl: `${baseUrl}/uploads/${year}/${month}/${day}/${baseName}_processed${ext}`,
    thumbnailUrl: `${baseUrl}/uploads/${year}/${month}/${day}/${baseName}_thumb${ext}`,
    size: file.size,
    mimetype: file.mimetype,
  };
};

// Generic upload endpoint to support clients sending different field names
// Accepts multipart form-data with either `file`, `image`, or `screenshot`
router.post('/', authenticate, (req: any, res, next) => (upload.any() as any)(req, res, next), async (req: any, res) => {
  try {
    if (!req.files || !(req.files as Express.Multer.File[]).length) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    await ensureStorageDir();

    const files = req.files as Express.Multer.File[];
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';

    // Prefer a known field first
    const preferred = files.find(f => ['file', 'image', 'screenshot'].includes((f as any).fieldname)) || files[0];
    const image = await handleSingleFile(preferred, baseUrl);

    return res.json({ success: true, message: 'File uploaded successfully', image });
  } catch (error) {
    console.error('Upload error (generic):', error);
    return res.status(500).json({ success: false, error: 'Failed to upload file' });
  }
});


// Ensure storage directory exists
const ensureStorageDir = async () => {
  const storageDir = path.join(__dirname, '../../storage');
  try {
    await fs.access(storageDir);
  } catch {
    await fs.mkdir(storageDir, { recursive: true });
  }
};

// Upload single image
router.post('/image', authenticate, upload.single('image'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    await ensureStorageDir();

    const originalPath = req.file.path;
    const filename = req.file.filename;
    const baseName = path.parse(filename).name;
    const ext = path.parse(filename).ext;

    // Process main image
    const processedPath = path.join(path.dirname(originalPath), `${baseName}_processed${ext}`);
    await processImage(originalPath, processedPath, {
      width: 800,
      height: 600,
      quality: 80
    });

    // Generate thumbnail
    const thumbnailPath = path.join(path.dirname(originalPath), `${baseName}_thumb${ext}`);
    await generateThumbnail(originalPath, thumbnailPath, 200);

    // Delete original file
    await fs.unlink(originalPath);

    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    const imageUrl = `${baseUrl}/uploads/${year}/${month}/${day}/${filename}`;
    const processedUrl = `${baseUrl}/uploads/${year}/${month}/${day}/${baseName}_processed${ext}`;
    const thumbnailUrl = `${baseUrl}/uploads/${year}/${month}/${day}/${baseName}_thumb${ext}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      image: {
        filename,
        url: imageUrl,
        processedUrl,
        thumbnailUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

// Upload multiple images
router.post('/images', authenticate, upload.array('images', 10), async (req: any, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image files provided'
      });
    }

    await ensureStorageDir();

    const uploadedImages: any[] = [];

    for (const file of req.files as Express.Multer.File[]) {
      const originalPath = file.path;
      const filename = file.filename;
      const baseName = path.parse(filename).name;
      const ext = path.parse(filename).ext;

      // Process main image
      const processedPath = path.join(path.dirname(originalPath), `${baseName}_processed${ext}`);
      await processImage(originalPath, processedPath, {
        width: 800,
        height: 600,
        quality: 80
      });

      // Generate thumbnail
      const thumbnailPath = path.join(path.dirname(originalPath), `${baseName}_thumb${ext}`);
      await generateThumbnail(originalPath, thumbnailPath, 200);

      // Delete original file
      await fs.unlink(originalPath);

      const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      
      const imageUrl = `${baseUrl}/uploads/${year}/${month}/${day}/${filename}`;
      const processedUrl = `${baseUrl}/uploads/${year}/${month}/${day}/${baseName}_processed${ext}`;
      const thumbnailUrl = `${baseUrl}/uploads/${year}/${month}/${day}/${baseName}_thumb${ext}`;

      uploadedImages.push({
        filename,
        url: imageUrl,
        processedUrl,
        thumbnailUrl,
        size: file.size,
        mimetype: file.mimetype,
      });
    }

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      images: uploadedImages
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload images'
    });
  }
});

// Upload payment screenshot
router.post('/payment-screenshot', authenticate, upload.single('screenshot'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No screenshot file provided'
      });
    }

    await ensureStorageDir();

    const originalPath = req.file.path;
    const filename = req.file.filename;
    const baseName = path.parse(filename).name;
    const ext = path.parse(filename).ext;

    // Process payment screenshot (smaller size)
    const processedPath = path.join(path.dirname(originalPath), `${baseName}_processed${ext}`);
    await processImage(originalPath, processedPath, {
      width: 600,
      height: 400,
      quality: 85
    });

    // Delete original file
    await fs.unlink(originalPath);

    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    const imageUrl = `${baseUrl}/uploads/${year}/${month}/${day}/${filename}`;
    const processedUrl = `${baseUrl}/uploads/${year}/${month}/${day}/${baseName}_processed${ext}`;

    res.json({
      success: true,
      message: 'Payment screenshot uploaded successfully',
      image: {
        filename,
        url: imageUrl,
        processedUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload payment screenshot'
    });
  }
});

// Delete image
router.delete('/:filename', authenticate, async (req: any, res) => {
  try {
    const { filename } = req.params;
    const storageDir = path.join(__dirname, '../../storage');
    const filePath = path.join(storageDir, filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Delete file
    await fs.unlink(filePath);

    // Also delete processed and thumbnail versions if they exist
    const baseName = path.parse(filename).name;
    const ext = path.parse(filename).ext;
    
    const processedPath = path.join(storageDir, `${baseName}_processed${ext}`);
    const thumbnailPath = path.join(storageDir, `${baseName}_thumb${ext}`);

    try {
      await fs.unlink(processedPath);
    } catch {
      // File doesn't exist, ignore
    }

    try {
      await fs.unlink(thumbnailPath);
    } catch {
      // File doesn't exist, ignore
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    });
  }
});

export default router;
