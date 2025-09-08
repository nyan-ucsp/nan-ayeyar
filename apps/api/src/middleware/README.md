# File Upload and Local Storage System

This directory contains the complete file upload and local object storage system for the Nan Ayeyar backend API.

## 🚀 Features

- **Secure File Upload**: Multer-based multipart upload handling
- **Local Storage**: Files stored in organized directory structure (`/storage/uploads/YYYY/MM/DD/`)
- **File Validation**: Image-only uploads with size and type restrictions
- **Path Security**: Protection against path traversal attacks
- **Image Processing**: Automatic resizing and optimization using Sharp
- **Thumbnail Generation**: Automatic thumbnail creation for images
- **Static File Serving**: Optimized file serving with caching headers
- **File Management**: Utilities for file deletion and cleanup
- **Admin Tools**: File management and storage analytics

## 📁 Directory Structure

```
/storage/uploads/
├── 2024/
│   ├── 01/
│   │   ├── 15/
│   │   │   ├── uuid1.jpg
│   │   │   ├── uuid1_thumb.jpg
│   │   │   ├── uuid2.png
│   │   │   └── uuid2_thumb.png
│   │   └── 16/
│   └── 02/
└── 2025/
```

## 🔧 Configuration

### File Upload Limits
- **Max File Size**: 5MB
- **Allowed Types**: JPEG, PNG, WebP
- **Max Files per Request**: 10
- **Storage Path**: `/storage/uploads/YYYY/MM/DD/`

### Image Processing
- **Max Dimensions**: 1200x1200px
- **Quality**: 85% (JPEG)
- **Thumbnail Size**: 300x300px
- **Format**: JPEG (optimized)

## 📋 API Endpoints

### File Upload Examples
- `POST /api/upload/product-image` - Single product image
- `POST /api/upload/product-gallery` - Multiple product images
- `POST /api/upload/payment-screenshot` - Payment proof
- `POST /api/upload/profile-picture` - User avatar
- `POST /api/upload/bulk` - Bulk file upload

### File Serving
- `GET /uploads/:year/:month/:day/:filename` - Serve file
- `GET /uploads/:year/:month/:day/:filename/thumb` - Serve thumbnail

### Admin File Management
- `GET /api/admin/files/stats` - Storage statistics
- `POST /api/admin/files/cleanup` - Clean orphaned files
- `DELETE /api/admin/files/batch` - Delete multiple files
- `GET /api/admin/files/analysis` - Detailed file analysis

## 💻 Usage Examples

### Basic File Upload

```typescript
import { upload, validateUploadedFile, formatUploadResponse } from '../middleware/upload';

// Single file upload
router.post('/upload', upload.single('image'), validateUploadedFile, (req, res) => {
  const response = formatUploadResponse(req.file);
  res.json(response);
});

// Multiple files upload
router.post('/upload-multiple', upload.array('images', 10), validateUploadedFiles, (req, res) => {
  const response = formatMultipleUploadResponse(req.files);
  res.json(response);
});
```

### File Processing

```typescript
import { processImage, generateThumbnail } from '../middleware/upload';

// Process uploaded image
await processImage(req.file.path, {
  width: 1200,
  height: 1200,
  quality: 85,
  format: 'jpeg'
});

// Generate thumbnail
await generateThumbnail(req.file.path, 300);
```

### File Management

```typescript
import { deleteFile, deleteFiles } from '../middleware/upload';

// Delete single file
const success = await deleteFile('/uploads/2024/01/15/uuid.jpg');

// Delete multiple files
const result = await deleteFiles([
  '/uploads/2024/01/15/uuid1.jpg',
  '/uploads/2024/01/15/uuid2.png'
]);
```

## 🔒 Security Features

### File Validation
- **MIME Type Checking**: Validates actual file content
- **Extension Validation**: Checks file extensions
- **Size Limits**: Enforces maximum file size
- **Path Sanitization**: Prevents path traversal attacks

### Upload Security
- **Filename Randomization**: Uses UUID for filenames
- **Directory Isolation**: Files stored in date-based directories
- **Input Sanitization**: Removes dangerous characters
- **Type Restrictions**: Only image files allowed

### Serving Security
- **Content-Type Headers**: Proper MIME type detection
- **Security Headers**: X-Content-Type-Options, X-Frame-Options
- **Path Validation**: Prevents directory traversal
- **ETag Support**: Efficient caching with validation

## 📊 File Management Utilities

### Storage Statistics
```typescript
import { getStorageStats } from '../utils/fileManager';

const stats = await getStorageStats();
console.log(`Total files: ${stats.totalFiles}`);
console.log(`Total size: ${stats.totalSize} bytes`);
```

### File Cleanup
```typescript
import { cleanupOrphanedFiles } from '../utils/fileManager';

// Clean up files not referenced in database
const result = await cleanupOrphanedFiles(referencedPaths);
console.log(`Deleted: ${result.deleted.length} files`);
```

### File Information
```typescript
import { getFileInfo } from '../utils/fileManager';

const info = await getFileInfo('/uploads/2024/01/15/uuid.jpg');
console.log(`Size: ${info.size} bytes`);
console.log(`Type: ${info.mimeType}`);
```

## 🎯 Frontend Integration

### Upload Form
```html
<form enctype="multipart/form-data">
  <input type="file" name="image" accept="image/*" required>
  <button type="submit">Upload</button>
</form>
```

### JavaScript Upload
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

fetch('/api/upload/product-image', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => {
  console.log('Upload successful:', data.data.path);
});
```

### Display Uploaded Images
```html
<img src="/uploads/2024/01/15/uuid.jpg" alt="Product Image">
<img src="/uploads/2024/01/15/uuid.jpg/thumb" alt="Thumbnail">
```

## 🛠️ Environment Variables

```env
# File Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=jpg,jpeg,png,webp
UPLOAD_PATH=./storage/uploads

# Image Processing
IMAGE_MAX_WIDTH=1200
IMAGE_MAX_HEIGHT=1200
IMAGE_QUALITY=85
THUMBNAIL_SIZE=300
```

## 📝 Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Invalid file type. Only jpg, jpeg, png, webp files are allowed."
}

{
  "success": false,
  "message": "File too large. Maximum size is 5MB."
}

{
  "success": false,
  "message": "No file uploaded"
}
```

### Error Handling in Routes
```typescript
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    // Handle upload
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});
```

## 🔄 File Lifecycle

1. **Upload**: File received and validated
2. **Processing**: Image resized and optimized
3. **Storage**: Saved to organized directory structure
4. **Thumbnail**: Thumbnail generated automatically
5. **Database**: Path stored in database
6. **Serving**: Files served with caching headers
7. **Cleanup**: Orphaned files removed periodically

## 📈 Performance Considerations

- **Caching**: Files cached for 1 year with ETag validation
- **Compression**: Images automatically compressed
- **Thumbnails**: Separate thumbnails for faster loading
- **CDN Ready**: Structure supports CDN integration
- **Lazy Loading**: Thumbnails for initial display

## 🧪 Testing

### Test File Upload
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test-image.jpg" \
  http://localhost:3001/api/upload/product-image
```

### Test File Serving
```bash
curl -I http://localhost:3001/uploads/2024/01/15/uuid.jpg
```

## 🚨 Troubleshooting

### Common Issues
1. **File not found**: Check file path and permissions
2. **Upload fails**: Verify file size and type
3. **Images not displaying**: Check MIME type and headers
4. **Thumbnails missing**: Ensure Sharp is installed

### Debug Mode
```typescript
// Enable debug logging
process.env.DEBUG = 'upload:*';
```

## 📚 Dependencies

- **multer**: File upload handling
- **sharp**: Image processing
- **uuid**: Unique filename generation
- **express**: Static file serving
- **fs**: File system operations

This file upload system provides a robust, secure, and scalable solution for handling file uploads and local storage in the Nan Ayeyar application.
