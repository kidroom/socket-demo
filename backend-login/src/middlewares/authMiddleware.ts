import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secretKey = "your-secret-key"; // 替換成你的金鑰

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, (err: any, user: any) => {
    if (err) {
      return res.sendStatus(403);
    }
    (req as any).user = user; // 將 user 物件添加到 req 中
    next();
  });
};
