import fs from 'fs';
import path from 'path';
import { deleteFile, deleteFiles, getAbsoluteStoragePath } from '../middleware/upload';

/**
 * File Manager Utility
 * Provides high-level file management operations for the application
 */

export interface FileInfo {
  path: string;
  size: number;
  mimeType: string;
  extension: string;
  createdAt: Date;
  modifiedAt: Date;
  exists: boolean;
}

export interface DeleteResult {
  success: boolean;
  deleted: string[];
  failed: string[];
  errors: string[];
}

/**
 * Get comprehensive file information
 */
export const getFileInfo = async (filePath: string): Promise<FileInfo> => {
  const absolutePath = filePath.startsWith('/') 
    ? getAbsoluteStoragePath(filePath)
    : path.join(process.cwd(), 'storage', filePath);

  const exists = fs.existsSync(absolutePath);
  
  if (!exists) {
    return {
      path: filePath,
      size: 0,
      mimeType: 'unknown',
      extension: path.extname(filePath),
      createdAt: new Date(),
      modifiedAt: new Date(),
      exists: false
    };
  }

  const stats = fs.statSync(absolutePath);
  const ext = path.extname(filePath).toLowerCase();
  
  return {
    path: filePath,
    size: stats.size,
    mimeType: getMimeType(ext),
    extension: ext,
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime,
    exists: true
  };
};

/**
 * Delete a single file and its thumbnail
 */
export const deleteFileWithThumbnail = async (filePath: string): Promise<boolean> => {
  try {
    const success = await deleteFile(filePath);
    return success;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
};

/**
 * Delete multiple files and their thumbnails
 */
export const deleteFilesWithThumbnails = async (filePaths: string[]): Promise<DeleteResult> => {
  const result: DeleteResult = {
    success: true,
    deleted: [],
    failed: [],
    errors: []
  };

  for (const filePath of filePaths) {
    try {
      const success = await deleteFileWithThumbnail(filePath);
      if (success) {
        result.deleted.push(filePath);
      } else {
        result.failed.push(filePath);
        result.errors.push(`Failed to delete: ${filePath}`);
      }
    } catch (error) {
      result.failed.push(filePath);
      result.errors.push(`Error deleting ${filePath}: ${error}`);
      result.success = false;
    }
  }

  return result;
};

/**
 * Clean up orphaned files (files not referenced in database)
 */
export const cleanupOrphanedFiles = async (referencedPaths: string[]): Promise<DeleteResult> => {
  const result: DeleteResult = {
    success: true,
    deleted: [],
    failed: [],
    errors: []
  };

  try {
    const uploadsDir = path.join(process.cwd(), 'storage', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return result;
    }

    // Get all files in uploads directory
    const allFiles = await getAllFilesInDirectory(uploadsDir);
    
    // Find orphaned files
    const orphanedFiles = allFiles.filter(file => {
      const relativePath = path.relative(uploadsDir, file);
      const normalizedPath = '/' + relativePath.replace(/\\/g, '/');
      return !referencedPaths.includes(normalizedPath);
    });

    // Delete orphaned files
    for (const filePath of orphanedFiles) {
      try {
        const relativePath = '/' + path.relative(uploadsDir, filePath).replace(/\\/g, '/');
        const success = await deleteFileWithThumbnail(relativePath);
        
        if (success) {
          result.deleted.push(relativePath);
        } else {
          result.failed.push(relativePath);
          result.errors.push(`Failed to delete orphaned file: ${relativePath}`);
        }
      } catch (error) {
        const relativePath = '/' + path.relative(uploadsDir, filePath).replace(/\\/g, '/');
        result.failed.push(relativePath);
        result.errors.push(`Error deleting orphaned file ${relativePath}: ${error}`);
        result.success = false;
      }
    }

  } catch (error) {
    result.success = false;
    result.errors.push(`Error during cleanup: ${error}`);
  }

  return result;
};

/**
 * Get all files in a directory recursively
 */
const getAllFilesInDirectory = async (dirPath: string): Promise<string[]> => {
  const files: string[] = [];
  
  const readDir = (currentPath: string) => {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        readDir(itemPath);
      } else {
        files.push(itemPath);
      }
    }
  };
  
  readDir(dirPath);
  return files;
};

/**
 * Get storage usage statistics
 */
export const getStorageStats = async (): Promise<{
  totalFiles: number;
  totalSize: number;
  filesByType: { [key: string]: { count: number; size: number } };
  filesByDate: { [key: string]: { count: number; size: number } };
}> => {
  const stats = {
    totalFiles: 0,
    totalSize: 0,
    filesByType: {} as { [key: string]: { count: number; size: number } },
    filesByDate: {} as { [key: string]: { count: number; size: number } }
  };

  try {
    const uploadsDir = path.join(process.cwd(), 'storage', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return stats;
    }

    const allFiles = await getAllFilesInDirectory(uploadsDir);
    
    for (const filePath of allFiles) {
      // Skip thumbnails
      if (filePath.includes('_thumb')) {
        continue;
      }

      const fileStats = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const date = path.basename(path.dirname(filePath)); // Get date from directory name
      
      stats.totalFiles++;
      stats.totalSize += fileStats.size;
      
      // Count by type
      if (!stats.filesByType[ext]) {
        stats.filesByType[ext] = { count: 0, size: 0 };
      }
      stats.filesByType[ext].count++;
      stats.filesByType[ext].size += fileStats.size;
      
      // Count by date
      if (!stats.filesByDate[date]) {
        stats.filesByDate[date] = { count: 0, size: 0 };
      }
      stats.filesByDate[date].count++;
      stats.filesByDate[date].size += fileStats.size;
    }

  } catch (error) {
    console.error('Error getting storage stats:', error);
  }

  return stats;
};

/**
 * Validate file path for security
 */
export const validateFilePath = (filePath: string): { valid: boolean; error?: string } => {
  // Check for path traversal
  if (filePath.includes('..') || filePath.includes('~')) {
    return { valid: false, error: 'Path traversal detected' };
  }

  // Check for absolute paths outside storage
  const absolutePath = path.resolve(filePath);
  const storagePath = path.resolve(process.cwd(), 'storage');
  
  if (!absolutePath.startsWith(storagePath)) {
    return { valid: false, error: 'Path outside storage directory' };
  }

  // Check for valid file extensions
  const ext = path.extname(filePath).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  if (!allowedExtensions.includes(ext)) {
    return { valid: false, error: 'Invalid file extension' };
  }

  return { valid: true };
};

/**
 * Get MIME type from file extension
 */
const getMimeType = (extension: string): string => {
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp'
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
};

/**
 * Create directory if it doesn't exist
 */
export const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Get file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Check if file is an image
 */
export const isImageFile = (filePath: string): boolean => {
  const ext = path.extname(filePath).toLowerCase();
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
  return imageExtensions.includes(ext);
};

/**
 * Get file age in days
 */
export const getFileAge = (filePath: string): number => {
  try {
    const absolutePath = filePath.startsWith('/') 
      ? getAbsoluteStoragePath(filePath)
      : path.join(process.cwd(), 'storage', filePath);
    
    if (!fs.existsSync(absolutePath)) {
      return -1;
    }

    const stats = fs.statSync(absolutePath);
    const now = new Date();
    const fileDate = stats.birthtime;
    const diffTime = Math.abs(now.getTime() - fileDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    return -1;
  }
};
