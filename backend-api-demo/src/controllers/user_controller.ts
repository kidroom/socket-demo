import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import userService from "../services/user_service";
import { UserStatus } from "../libs/db_enum";

const secretKey =
  "18bfaf64981d6ff162af44be0ae4086451b57b6f065343c862669963ae99aefd"; // 應使用 .env 儲存金鑰

class UserController {
  /** 使用者註冊
   * @param password
   * @returns 雜湊後的密碼字串
   */
  public async Register(req: Request, res: Response): Promise<void> {
    const { account, password } = req.body;

    if (!account || !password) {
      res.status(401).json({ message: "請提供使用者名稱和密碼" });
      return;
    }

    const exists = await userService.CheckUserExistAsync(account);
    if (exists) {
      res.status(401).json({ message: "使用者名稱已存在" });
      return;
    }

    await userService.UserRegisterAsync(account, password);

    res.status(201).json({ message: "註冊成功" });
  }

  /** 登入
   * @param req
   * @param res
   * @returns
   */
  public async Login(req: Request, res: Response): Promise<void> {
    const cookies = req.cookies;
    const user_agent = req.headers["user-agent"];
    if (await userService.CheckTokenAsync(cookies["token"], user_agent)) {
      res.json({ message: cookies["token"] });
      return;
    }
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

    await userService.SetTokenAsync(user.id, token, "");

    res.json({ message: token });
  }

  /** 重設密碼
   * @param req
   * @param res
   * @returns
   */
  public async ResetPassword(req: Request, res: Response): Promise<void> {
    const { account, password } = req.body;

    let user = await userService.GetExistUserByAccountAsync(account);
    if (!user) {
      res.status(401).json({ message: "使用者名稱或密碼錯誤" });
      return;
    }

    let success = await userService.ResetPassword(user);
    if (!success) {
      res.status(500).json({ message: "密碼重設失敗" });
      return;
    }

    res.json({ message: "修改完成" });
  }

  public protectedRoute(req: Request, res: Response): void {
    res.json({
      message: `歡迎，${(req as any).user.username}！這是受保護的內容。`,
    });
  }
}

export default new UserController();
