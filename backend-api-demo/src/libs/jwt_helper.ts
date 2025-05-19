import jwt from "jsonwebtoken";

const secretKey =
  "18bfaf64981d6ff162af44be0ae4086451b57b6f065343c862669963ae99aefd"; // 應使用 .env 儲存金鑰
const expireSize = "1h";

interface VerifiedTokenPayload {
  userId: number;
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
      console.error("錯誤類型: Token 已過期！");
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error("錯誤類型: 無效的 Token 或簽名！");
    } else {
      console.error("其他 JWT 錯誤:", error);
    }
    return null;
  }

  return verifiedPayload;
}

export function SignJwt(data: any): string {
  const token = jwt.sign(data, secretKey, {
    expiresIn: expireSize,
  });

  return token;
}
