import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { sendEmail, getOTPEmailTemplate } from '../utils/email';
import { generateOTP, hashOTP, verifyOTP, getOTPExpiry, isOTPExpired } from '../utils/otp';
import { authenticate, AuthRequest } from '../middleware/auth';
import { otpRateLimit, authRateLimit } from '../middleware/rateLimiter';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Register new user
 * Creates user account and sends OTP for email verification
 */
router.post('/register', otpRateLimit, [
  body('email').isEmail().normalizeEmail(),
  body('name').notEmpty().trim(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('address').notEmpty().trim(),
  body('locale').isIn(['en', 'my']).optional(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, name, password, address, locale = 'en' } = req.body;

    // Check if user already exists and is verified
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // If user exists but is not verified, update their information and generate new OTP
    if (existingUser && !existingUser.isEmailVerified) {
      // Hash the password
      const passwordHash = await bcrypt.hash(password, 12);
      
      // Update user information
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          passwordHash,
          address,
          locale,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          address: true,
          locale: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
        }
      });

      // Delete any existing OTPs for this user
      await prisma.otp.deleteMany({
        where: { userId: existingUser.id }
      });

      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = await bcrypt.hash(otp, 10);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.otp.create({
        data: {
          code: otpHash,
          userId: existingUser.id,
          expiresAt,
          attempts: 0,
          consumed: false,
        }
      });

      // Send OTP email
      try {
        const emailTemplate = getOTPEmailTemplate(otp, locale);
        await sendEmail({
          to: email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });
        console.log(`OTP email sent successfully to ${email} for existing unverified user`);
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
        // Don't fail the registration if email sending fails
      }

      return res.status(200).json({
        success: true,
        message: 'User information updated. Please check your email for OTP.',
        user: updatedUser
      });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create user with password
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        address,
        locale,
        isEmailVerified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        address: true,
        locale: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      }
    });

    // Generate and store OTP
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    const expiresAt = getOTPExpiry();

    await prisma.otp.create({
      data: {
        code: hashedOtp,
        userId: user.id,
        expiresAt,
        attempts: 0,
        consumed: false,
      }
    });

    // Send OTP email
    try {
      const emailTemplate = getOTPEmailTemplate(otp, locale);
      await sendEmail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });
      console.log(`OTP email sent successfully to ${email}`);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Don't fail the registration if email sending fails
      // The user is still created and OTP is stored in database
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for OTP.',
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Verify OTP and complete registration
 * Verifies OTP code and returns JWT token
 */
router.post('/verify-otp', otpRateLimit, [
  body('email').isEmail().normalizeEmail(),
  body('otp').matches(/^[0-9]{6}$/).withMessage('OTP must be 6 digits'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, otp } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Find valid OTP
    const otpRecord = await prisma.otp.findFirst({
      where: {
        userId: user.id,
        consumed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: 'OTP expired or not found. Please request a new OTP code.',
        errorCode: 'OTP_EXPIRED'
      });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        error: 'OTP code has expired. Please request a new OTP code.',
        errorCode: 'OTP_EXPIRED'
      });
    }

    // Check attempt limit
    if (otpRecord.attempts >= 5) {
      return res.status(400).json({
        success: false,
        error: 'Too many failed attempts. Please request a new OTP code.',
        errorCode: 'MAX_ATTEMPTS_EXCEEDED'
      });
    }

    // Verify OTP
    const isOtpValid = await verifyOTP(otp, otpRecord.code);
    
    if (!isOtpValid) {
      // Increment attempts
      await prisma.otp.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 }
      });

      const remainingAttempts = 5 - (otpRecord.attempts + 1);
      return res.status(400).json({
        success: false,
        error: `Invalid OTP code. ${remainingAttempts > 0 ? `You have ${remainingAttempts} attempts remaining.` : 'Please request a new OTP code.'}`,
        errorCode: 'INVALID_OTP',
        remainingAttempts: remainingAttempts
      });
    }

    // Mark OTP as consumed and verify user
    await Promise.all([
      prisma.otp.update({
        where: { id: otpRecord.id },
        data: { consumed: true }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true }
      })
    ]);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          address: user.address,
          locale: user.locale,
          role: user.role,
          isEmailVerified: true,
        }
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Login with email and password
 * Authenticates user and returns JWT token
 */
router.post('/login', authRateLimit, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          address: user.address,
          locale: user.locale,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Request new OTP
 * Sends a new OTP to user's email
 */
router.post('/request-otp', otpRateLimit, [
  body('email').isEmail().normalizeEmail(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate and store new OTP
    const otp = generateOTP();
    const hashedOtp = await hashOTP(otp);
    const expiresAt = getOTPExpiry();

    await prisma.otp.create({
      data: {
        code: hashedOtp,
        userId: user.id,
        expiresAt,
        attempts: 0,
        consumed: false,
      }
    });

    // Send OTP email
    try {
      const emailTemplate = getOTPEmailTemplate(otp, user.locale);
      await sendEmail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });
      console.log(`OTP resend email sent successfully to ${email}`);
    } catch (emailError) {
      console.error('Failed to resend OTP email:', emailError);
      // Still return success since OTP was generated and stored
      // User can try to verify with the OTP even if email failed
    }

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get current user
 * Returns authenticated user information
 */
router.get('/me', authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        address: true,
        locale: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Forgot Password
 * Send password reset OTP to user's email
 */
router.post('/forgot-password', otpRateLimit, [
  body('email').isEmail().normalizeEmail(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset code.'
      });
    }

    // Generate OTP for password reset
    const otpCode = generateOTP();
    const hashedOTP = await hashOTP(otpCode);
    const expiresAt = getOTPExpiry();

    // Store OTP in database
    await prisma.otp.create({
      data: {
        code: hashedOTP,
        userId: user.id,
        expiresAt,
        attempts: 0,
        consumed: false
      }
    });

    // Send OTP email
    try {
      const emailTemplate = getOTPEmailTemplate(otpCode, user.locale || 'en', 'password-reset');
      await sendEmail({
        to: user.email,
        subject: user.locale === 'my' 
          ? 'Nan Ayeyar - စကားဝှက် ပြန်လည်သတ်မှတ်ရန် ကုဒ်'
          : 'Nan Ayeyar - Password Reset Code',
        html: emailTemplate.html,
        text: emailTemplate.text
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset code.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Reset Password
 * Reset password using OTP verification
 */
router.post('/reset-password', otpRateLimit, [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('New password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('New password must contain at least one number')
    .matches(/[^A-Za-z0-9]/).withMessage('New password must contain at least one special character'),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, otp, newPassword } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Find valid OTP
    const otpRecord = await prisma.otp.findFirst({
      where: {
        userId: user.id,
        consumed: false,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP code'
      });
    }

    // Verify OTP
    const isOTPValid = await verifyOTP(otp, otpRecord.code);
    if (!isOTPValid) {
      // Increment attempts
      await prisma.otp.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 }
      });

      return res.status(400).json({
        success: false,
        error: 'Invalid OTP code'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and mark OTP as consumed
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashedPassword,
          updatedAt: new Date()
        }
      }),
      prisma.otp.update({
        where: { id: otpRecord.id },
        data: { consumed: true }
      })
    ]);

    // Generate JWT token for auto-login
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        isEmailVerified: user.isEmailVerified 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Logout
 * Client-side token removal (server doesn't store tokens)
 */
router.post('/logout', authenticate, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

export default router;
