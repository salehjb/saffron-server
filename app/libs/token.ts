import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET as string;

export function generateToken(payload: any, expiresIn: string) {
  try {
    const token = jwt.sign(payload, secretKey, { expiresIn });
    return token;
  } catch (error) {
    throw error;
  }
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    throw error;
  }
}
