import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
  };
}

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isEmailVerified: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token or user not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token.'
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expired.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Authentication error.'
    });
  }
};

/**
 * Role-based Authorization Middleware
 * Checks if user has required role(s)
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No user found.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

/**
 * Admin-only Authorization Middleware
 * Shortcut for admin role check
 */
export const requireAdmin = authorize('admin');

/**
 * Email Verification Middleware
 * Ensures user has verified their email
 */
export const requireEmailVerification = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No user found.'
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      error: 'Email verification required.'
    });
  }

  next();
};
