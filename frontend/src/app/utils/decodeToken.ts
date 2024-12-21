import jwt from 'jsonwebtoken';

export function decodeToken(token: string) {
  try {
    const decoded = jwt.decode(token); 
    if (decoded && typeof decoded === 'object') {
      return { userid: decoded.userid, role: decoded.role };
    }
  } catch (error) {
    console.error('Failed to decode token:', error);
  }
  return null; 
}
