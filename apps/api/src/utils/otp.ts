import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generate a 6-digit numeric OTP
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash OTP for secure storage
 */
export const hashOTP = async (otp: string): Promise<string> => {
  return await bcrypt.hash(otp, 10);
};

/**
 * Verify OTP against hash
 */
export const verifyOTP = async (otp: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(otp, hash);
};

/**
 * Generate OTP expiry time (10 minutes from now)
 */
export const getOTPExpiry = (): Date => {
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10');
  return new Date(Date.now() + expiryMinutes * 60 * 1000);
};

/**
 * Check if OTP is expired
 */
export const isOTPExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};

/**
 * Generate secure random string for transaction IDs
 */
export const generateTransactionId = (): string => {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
};
