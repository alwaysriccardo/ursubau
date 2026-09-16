import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

export interface AuthPayload {
  username: string;
  iat?: number;
  exp?: number;
}

export const verifyPassword = async (password: string): Promise<boolean> => {
  const storedPassword = process.env.ADMIN_PASSWORD;
  if (!storedPassword) return false;
  
  // For simplicity, we'll do a direct comparison
  // In production, you'd want to hash the password
  return password === storedPassword;
};

export const generateToken = (username: string): string => {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): AuthPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (error) {
    return null;
  }
};

export const extractToken = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};
