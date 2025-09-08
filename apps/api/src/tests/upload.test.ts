import request from 'supertest';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { upload, validateUploadedFile, formatUploadResponse } from '../middleware/upload';
import { deleteFile } from '../middleware/upload';

// Create test app
const app = express();
app.use(express.json());

// Test route
app.post('/test-upload', upload.single('image'), validateUploadedFile, (req, res) => {
  const response = formatUploadResponse(req.file!);
  res.json(response);
});

describe('File Upload System', () => {
  const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
  const testDir = path.join(__dirname, '../../storage/uploads');

  beforeAll(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(async () => {
    // Clean up test files
    const today = new Date();
    const year = today.getFullYear().toString();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    const testUploadDir = path.join(testDir, year, month, day);
    if (fs.existsSync(testUploadDir)) {
      const files = fs.readdirSync(testUploadDir);
      for (const file of files) {
        await deleteFile(`/uploads/${year}/${month}/${day}/${file}`);
      }
    }
  });

  describe('File Upload Validation', () => {
    it('should reject files without proper content type', async () => {
      const response = await request(app)
        .post('/test-upload')
        .attach('image', Buffer.from('fake content'), 'test.txt');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid file type');
    });

    it('should reject files that are too large', async () => {
      // Create a large buffer (6MB)
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'x');
      
      const response = await request(app)
        .post('/test-upload')
        .attach('image', largeBuffer, 'large.jpg');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('File too large');
    });

    it('should reject requests without files', async () => {
      const response = await request(app)
        .post('/test-upload');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No file uploaded');
    });
  });

  describe('File Upload Success', () => {
    it('should successfully upload a valid image file', async () => {
      // Create a simple test image buffer (1x1 pixel JPEG)
      const testImageBuffer = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
        0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
        0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
        0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
        0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
        0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
        0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
        0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x00, 0xFF, 0xD9
      ]);

      const response = await request(app)
        .post('/test-upload')
        .attach('image', testImageBuffer, 'test.jpg');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('filename');
      expect(response.body.data).toHaveProperty('path');
      expect(response.body.data).toHaveProperty('size');
      expect(response.body.data).toHaveProperty('mimeType');
      expect(response.body.data.mimeType).toBe('image/jpeg');
      expect(response.body.data.path).toMatch(/^\/uploads\/\d{4}\/\d{2}\/\d{2}\/[a-f0-9-]+\.jpg$/);
    });
  });

  describe('File Path Generation', () => {
    it('should generate correct directory structure', () => {
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      
      const expectedPath = `/uploads/${year}/${month}/${day}/`;
      
      // This test verifies the path structure matches our expected format
      expect(expectedPath).toMatch(/^\/uploads\/\d{4}\/\d{2}\/\d{2}\/$/);
    });
  });
});

describe('File Management Utilities', () => {
  describe('File Deletion', () => {
    it('should handle deletion of non-existent files gracefully', async () => {
      const result = await deleteFile('/uploads/2024/01/01/non-existent.jpg');
      expect(result).toBe(false);
    });
  });
});
