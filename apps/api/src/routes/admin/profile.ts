import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Apply authentication and admin role middleware to all routes
router.use(authenticate);
router.use(requireAdmin);

// Update admin profile
router.patch('/', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, address } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    updateData.updatedAt = new Date();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        address: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// Change admin password
router.patch('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('New password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('New password must contain at least one number')
    .matches(/[^A-Za-z0-9]/).withMessage('New password must contain at least one special character'),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Get current user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        error: 'No password set for this account'
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

export default router;
