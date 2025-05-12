import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import userService from "../services/user_service";
import { UserStatus } from "../libs/db_enum";

const secretKey = "your-secret-key"; // 應使用 .env 儲存金鑰

class UserController {
  /**
   * 使用者註冊
   * @param password
   * @returns 雜湊後的密碼字串
   */
  public async Register(req: Request, res: Response): Promise<void> {
    const { account, password } = req.body;

    if (!account || !password) {
      res.status(400).json({ message: "請提供使用者名稱和密碼" });
      return;
    }

    const exists = await userService.CheckUserExistAsync(account);
    if (exists) {
      res.status(409).json({ message: "使用者名稱已存在" });
      return;
    }

    await userService.UserRegisterAsync(account, password);

    res.status(201).json({ message: "註冊成功" });
  }

  public async Login(req: Request, res: Response): Promise<void> {
    const { account, password } = req.body;

    let user = await userService.GetExistUserByAccountAsync(account);
    if (!user) {
      res.status(401).json({ message: "使用者名稱或密碼錯誤" });
      return;
    }

    let success = await userService.LoginAsync(user, password);
    if (!success) {
      res.status(401).json({ message: "使用者名稱或密碼錯誤" });
      return;
    }

    const token = jwt.sign({ username: user.id }, secretKey, {
      expiresIn: "1h",
    });
    res.json({ token });
  }

  public protectedRoute(req: Request, res: Response): void {
    res.json({
      message: `歡迎，${(req as any).user.username}！這是受保護的內容。`,
    });
  }

  public api(req: Request, res: Response): void {
    res.json({
      message: `${UserStatus.Activity}`,
    });
  }
}

export default new UserController();
