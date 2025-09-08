import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for OTP endpoints
 * Prevents abuse of OTP generation and verification
 */
export const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 OTP requests per window
  message: {
    success: false,
    error: 'Too many OTP requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  }
});

/**
 * General API rate limiter
 * Prevents general API abuse
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requests per window
  message: {
    success: false,
    error: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  }
});

/**
 * Strict rate limiter for authentication endpoints
 * More restrictive for login attempts
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Maximum 10 login attempts per window
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
