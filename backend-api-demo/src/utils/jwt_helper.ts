import jwt from "jsonwebtoken";
import logger from "./logger";

const secretKey = process.env.JWT_SECRET || "18bfaf64981d6ff162af44be0ae4086451b57b6f065343c862669963ae99aefd"; // 應使用 .env 儲存金鑰
const expireSize = process.env.JWT_EXPIRES_IN || "1h";

interface VerifiedTokenPayload {
  userId: string;
  username: string;
  device: string;
  iat: number; // issued at
  exp: number; // expiration time
  [key: string]: any; // 允許其他屬性
}

export function TryParseJwt(token: string): VerifiedTokenPayload | null {
  let verifiedPayload: VerifiedTokenPayload;
  try {
    verifiedPayload = jwt.verify(token, secretKey) as VerifiedTokenPayload;
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.error("錯誤類型: Token 已過期！");
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.error("錯誤類型: 無效的 Token 或簽名！");
    } else {
      logger.error("其他 JWT 錯誤:", error);
    }
    return null;
  }

  return verifiedPayload;
}

export function SignJwt(data: object): string {
  const token = jwt.sign(
    data,
    secretKey as jwt.Secret,
    { 
      expiresIn: expireSize,
    } as jwt.SignOptions
  );

  return token;
}
