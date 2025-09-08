/**
 * Utility function to convert relative image paths to full URLs
 * Handles both API-served images and external URLs
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) {
    return '/placeholder-image.jpg'; // Fallback image
  }

  // If it's already a full URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a relative path starting with /storage, prepend API base URL
  if (imagePath.startsWith('/storage/')) {
    return `${API_BASE_URL}${imagePath}`;
  }

  // If it's a relative path starting with /uploads, prepend API base URL
  if (imagePath.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imagePath}`;
  }

  // For any other relative path, prepend API base URL
  return `${API_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

export const getImageUrls = (imagePaths: string[] | undefined | null): string[] => {
  if (!imagePaths || imagePaths.length === 0) {
    return ['/placeholder-image.jpg']; // Fallback image
  }

  return imagePaths.map(getImageUrl);
};
