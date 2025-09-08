import express from 'express';
import path from 'path';
import fs from 'fs';
import { authenticate, requireAdmin } from '../middleware/auth';
import { getAbsoluteStoragePath, getFileInfo } from '../middleware/upload';

const router = express.Router();

// Handle CORS preflight requests for uploads
router.options('/uploads/:year/:month/:day/:filename', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  });
  res.status(200).end();
});

// Serve static files with caching headers
router.get('/uploads/:year/:month/:day/:filename', (req, res) => {
  try {
    const { year, month, day, filename } = req.params;
    
    // Validate path parameters
    if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || !/^\d{2}$/.test(day)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format in URL'
      });
    }

    // Sanitize filename to prevent path traversal
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    if (sanitizedFilename !== filename) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    // Construct file path
    const filePath = path.join(
      process.cwd(),
      'storage',
      'uploads',
      year,
      month,
      day,
      sanitizedFilename
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Get file info
    const fileInfo = getFileInfo(filePath);
    
    // Set appropriate headers with CORS support
    res.set({
      'Content-Type': fileInfo.mimeType,
      'Content-Length': fileInfo.size.toString(),
      'Cache-Control': 'public, max-age=31536000', // 1 year cache
      'ETag': `"${fileInfo.size}-${fileInfo.modifiedAt.getTime()}"`,
      'Last-Modified': fileInfo.modifiedAt.toUTCString(),
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    });

    // Check if client has cached version
    const ifNoneMatch = req.headers['if-none-match'];
    const ifModifiedSince = req.headers['if-modified-since'];
    
    if (ifNoneMatch && ifNoneMatch === `"${fileInfo.size}-${fileInfo.modifiedAt.getTime()}"`) {
      return res.status(304).end();
    }
    
    if (ifModifiedSince && new Date(ifModifiedSince) >= fileInfo.modifiedAt) {
      return res.status(304).end();
    }

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error reading file'
        });
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Serve thumbnail files
router.get('/uploads/:year/:month/:day/:filename/thumb', (req, res) => {
  try {
    const { year, month, day, filename } = req.params;
    
    // Validate path parameters
    if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || !/^\d{2}$/.test(day)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format in URL'
      });
    }

    // Sanitize filename
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    if (sanitizedFilename !== filename) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    // Construct thumbnail path
    const ext = path.extname(sanitizedFilename);
    const thumbnailFilename = sanitizedFilename.replace(ext, `_thumb${ext}`);
    
    const filePath = path.join(
      process.cwd(),
      'storage',
      'uploads',
      year,
      month,
      day,
      thumbnailFilename
    );

    // Check if thumbnail exists, fallback to original
    const finalPath = fs.existsSync(filePath) ? filePath : path.join(
      process.cwd(),
      'storage',
      'uploads',
      year,
      month,
      day,
      sanitizedFilename
    );

    if (!fs.existsSync(finalPath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Get file info
    const fileInfo = getFileInfo(finalPath);
    
    // Set headers with CORS support
    res.set({
      'Content-Type': fileInfo.mimeType,
      'Content-Length': fileInfo.size.toString(),
      'Cache-Control': 'public, max-age=31536000',
      'ETag': `"${fileInfo.size}-${fileInfo.modifiedAt.getTime()}"`,
      'Last-Modified': fileInfo.modifiedAt.toUTCString(),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    });

    // Stream the file
    const fileStream = fs.createReadStream(finalPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error serving thumbnail:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin route to delete files
router.delete('/uploads/:year/:month/:day/:filename', authenticate, requireAdmin, async (req, res) => {
  try {
    const { year, month, day, filename } = req.params;
    
    // Validate path parameters
    if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || !/^\d{2}$/.test(day)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format in URL'
      });
    }

    // Sanitize filename
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    if (sanitizedFilename !== filename) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    // Construct file path
    const filePath = path.join(
      process.cwd(),
      'storage',
      'uploads',
      year,
      month,
      day,
      sanitizedFilename
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete file and thumbnail
    const ext = path.extname(sanitizedFilename);
    const thumbnailPath = filePath.replace(ext, `_thumb${ext}`);
    
    let deletedFiles: string[] = [];
    
    // Delete main file
    fs.unlinkSync(filePath);
    deletedFiles.push(sanitizedFilename);
    
    // Delete thumbnail if exists
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
      deletedFiles.push(`${sanitizedFilename.replace(ext, `_thumb${ext}`)}`);
    }

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: {
        deletedFiles,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin route to get file information
router.get('/uploads/:year/:month/:day/:filename/info', authenticate, requireAdmin, (req, res) => {
  try {
    const { year, month, day, filename } = req.params;
    
    // Validate path parameters
    if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || !/^\d{2}$/.test(day)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format in URL'
      });
    }

    // Sanitize filename
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    if (sanitizedFilename !== filename) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    // Construct file path
    const filePath = path.join(
      process.cwd(),
      'storage',
      'uploads',
      year,
      month,
      day,
      sanitizedFilename
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Get file info
    const fileInfo = getFileInfo(filePath);
    
    res.json({
      success: true,
      data: {
        filename: sanitizedFilename,
        path: `/uploads/${year}/${month}/${day}/${sanitizedFilename}`,
        size: fileInfo.size,
        mimeType: fileInfo.mimeType,
        extension: fileInfo.extension,
        createdAt: fileInfo.createdAt,
        modifiedAt: fileInfo.modifiedAt,
        hasThumbnail: fs.existsSync(filePath.replace(path.extname(filePath), `_thumb${path.extname(filePath)}`))
      }
    });

  } catch (error) {
    console.error('Error getting file info:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin route to list files in a directory
router.get('/uploads/:year/:month/:day', authenticate, requireAdmin, (req, res) => {
  try {
    const { year, month, day } = req.params;
    
    // Validate path parameters
    if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || !/^\d{2}$/.test(day)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format in URL'
      });
    }

    // Construct directory path
    const dirPath = path.join(
      process.cwd(),
      'storage',
      'uploads',
      year,
      month,
      day
    );

    // Check if directory exists
    if (!fs.existsSync(dirPath)) {
      return res.json({
        success: true,
        data: [],
        count: 0
      });
    }

    // Read directory
    const files = fs.readdirSync(dirPath);
    const fileList = files
      .filter(file => !file.includes('_thumb')) // Exclude thumbnails from main list
      .map(file => {
        const filePath = path.join(dirPath, file);
        const fileInfo = getFileInfo(filePath);
        const ext = path.extname(file);
        const hasThumbnail = fs.existsSync(filePath.replace(ext, `_thumb${ext}`));
        
        return {
          filename: file,
          path: `/uploads/${year}/${month}/${day}/${file}`,
          size: fileInfo.size,
          mimeType: fileInfo.mimeType,
          extension: fileInfo.extension,
          createdAt: fileInfo.createdAt,
          modifiedAt: fileInfo.modifiedAt,
          hasThumbnail
        };
      });

    res.json({
      success: true,
      data: fileList,
      count: fileList.length
    });

  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
