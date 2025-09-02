import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret = (process.env.JWT_SECRET as Secret) || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN_ENV = process.env.JWT_EXPIRES_IN || '7d';
const JWT_EXPIRES_IN: SignOptions['expiresIn'] = (JWT_EXPIRES_IN_ENV as unknown) as SignOptions['expiresIn'];

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const generateToken = (payload: JWTPayload): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};
