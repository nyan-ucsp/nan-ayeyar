import express from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { 
  getStorageStats, 
  cleanupOrphanedFiles, 
  formatFileSize,
  getFileAge,
  isImageFile 
} from '../../utils/fileManager';
import { deleteFilesWithThumbnails } from '../../utils/fileManager';

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /admin/files/stats
 * Get storage usage statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getStorageStats();
    
    // Format file sizes for display
    const formattedStats = {
      ...stats,
      totalSizeFormatted: formatFileSize(stats.totalSize),
      filesByType: Object.entries(stats.filesByType).map(([ext, data]) => ({
        extension: ext,
        count: data.count,
        size: data.size,
        sizeFormatted: formatFileSize(data.size)
      })),
      filesByDate: Object.entries(stats.filesByDate).map(([date, data]) => ({
        date,
        count: data.count,
        size: data.size,
        sizeFormatted: formatFileSize(data.size)
      }))
    };

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('Error getting storage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get storage statistics'
    });
  }
});

/**
 * POST /admin/files/cleanup
 * Clean up orphaned files (files not referenced in database)
 */
router.post('/cleanup', async (req, res) => {
  try {
    const { referencedPaths } = req.body;
    
    if (!Array.isArray(referencedPaths)) {
      return res.status(400).json({
        success: false,
        message: 'referencedPaths must be an array'
      });
    }

    const result = await cleanupOrphanedFiles(referencedPaths);
    
    res.json({
      success: result.success,
      data: {
        deleted: result.deleted,
        failed: result.failed,
        errors: result.errors,
        summary: {
          totalDeleted: result.deleted.length,
          totalFailed: result.failed.length,
          totalErrors: result.errors.length
        }
      }
    });

  } catch (error) {
    console.error('Error cleaning up files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup orphaned files'
    });
  }
});

/**
 * DELETE /admin/files/batch
 * Delete multiple files
 */
router.delete('/batch', async (req, res) => {
  try {
    const { filePaths } = req.body;
    
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'filePaths must be a non-empty array'
      });
    }

    // Validate file paths
    const validPaths = filePaths.filter(path => {
      if (typeof path !== 'string') return false;
      if (!path.startsWith('/uploads/')) return false;
      return true;
    });

    if (validPaths.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid file paths provided'
      });
    }

    const result = await deleteFilesWithThumbnails(validPaths);
    
    res.json({
      success: result.success,
      data: {
        deleted: result.deleted,
        failed: result.failed,
        errors: result.errors,
        summary: {
          totalRequested: filePaths.length,
          totalDeleted: result.deleted.length,
          totalFailed: result.failed.length
        }
      }
    });

  } catch (error) {
    console.error('Error deleting files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete files'
    });
  }
});

/**
 * GET /admin/files/analysis
 * Get detailed file analysis
 */
router.get('/analysis', async (req, res) => {
  try {
    const stats = await getStorageStats();
    
    // Analyze file types
    const fileTypeAnalysis = Object.entries(stats.filesByType).map(([ext, data]) => ({
      extension: ext,
      count: data.count,
      size: data.size,
      sizeFormatted: formatFileSize(data.size),
      percentage: ((data.count / stats.totalFiles) * 100).toFixed(2),
      averageSize: Math.round(data.size / data.count)
    }));

    // Analyze by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentFiles = Object.entries(stats.filesByDate)
      .filter(([date]) => {
        const fileDate = new Date(date);
        return fileDate >= thirtyDaysAgo;
      })
      .map(([date, data]) => ({
        date,
        count: data.count,
        size: data.size,
        sizeFormatted: formatFileSize(data.size)
      }));

    // Calculate storage efficiency
    const totalSizeMB = stats.totalSize / (1024 * 1024);
    const averageFileSize = stats.totalFiles > 0 ? stats.totalSize / stats.totalFiles : 0;
    
    const analysis = {
      overview: {
        totalFiles: stats.totalFiles,
        totalSize: stats.totalSize,
        totalSizeFormatted: formatFileSize(stats.totalSize),
        averageFileSize: Math.round(averageFileSize),
        averageFileSizeFormatted: formatFileSize(averageFileSize)
      },
      fileTypes: fileTypeAnalysis,
      recentActivity: {
        last30Days: recentFiles,
        totalRecentFiles: recentFiles.reduce((sum, day) => sum + day.count, 0),
        totalRecentSize: recentFiles.reduce((sum, day) => sum + day.size, 0)
      },
      recommendations: generateStorageRecommendations(stats)
    };

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Error analyzing files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze files'
    });
  }
});

/**
 * Generate storage recommendations based on analysis
 */
const generateStorageRecommendations = (stats: any): string[] => {
  const recommendations: string[] = [];
  
  // Check for large files
  const averageFileSize = stats.totalFiles > 0 ? stats.totalSize / stats.totalFiles : 0;
  if (averageFileSize > 2 * 1024 * 1024) { // 2MB
    recommendations.push('Consider optimizing large images to reduce storage usage');
  }
  
  // Check for many files
  if (stats.totalFiles > 1000) {
    recommendations.push('Consider implementing file archiving for old files');
  }
  
  // Check for storage usage
  const totalSizeGB = stats.totalSize / (1024 * 1024 * 1024);
  if (totalSizeGB > 1) {
    recommendations.push('Storage usage is high. Consider implementing cleanup routines');
  }
  
  // Check for file type distribution
  const jpegFiles = stats.filesByType['.jpg'] || { count: 0 };
  const pngFiles = stats.filesByType['.png'] || { count: 0 };
  
  if (pngFiles.count > jpegFiles.count) {
    recommendations.push('Consider converting PNG files to JPEG for better compression');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Storage usage looks good. No immediate optimizations needed.');
  }
  
  return recommendations;
};

export default router;
