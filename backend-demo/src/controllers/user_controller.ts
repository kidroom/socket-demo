import { Request, Response } from "express";
import user_service from "../services/user_service";
import auth_service from "../services/auth_service";
import { MyCustomActionFilter, LogActionFilter } from "../libs/filter";

class UserController {
  /** 使用者註冊
   * @param req
   * @param res
   * @returns
   */
  @MyCustomActionFilter(new LogActionFilter())
  public async Register(req: Request, res: Response): Promise<void> {
    const { account, password } = req.body;

    if (!account || !password) {
      res.status(401).json({ message: "請提供使用者名稱和密碼" });
      return;
    }

    const exists = await user_service.CheckUserExistAsync(account);
    if (exists) {
      res.status(401).json({ message: "使用者名稱已存在" });
      return;
    }

    await user_service.UserRegisterAsync(account, password);

    res.apiSuccess({}, "註冊成功", 201);
  }

  /** 登入
   * @param req
   * @param res
   * @returns
   */
  @MyCustomActionFilter(new LogActionFilter())
  public async Login(req: Request, res: Response): Promise<void> {
    const cookies = req.cookies;
    const user_agent = req.headers["user-agent"];
    if (await auth_service.CheckTokenAsync(cookies["token"], user_agent)) {
      console.log(`already have token`);
      res.json({ message: cookies["token"] });
      return;
    }
    const { account, password } = req.body;

    let user = await user_service.GetExistUserByAccountAsync(account);
    if (!user) {
      res.status(401).json({ message: "使用者名稱或密碼錯誤" });
      return;
    }

    let success = await user_service.LoginAsync(user, password);
    if (!success) {
      res.status(401).json({ message: "使用者名稱或密碼錯誤" });
      return;
    }

    const token = await auth_service.SetTokenAsync(user.id, user_agent);

    res.apiSuccess({
      user: {
        id: user.id,
        account: user.account,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token: token,
    });
  }

  /** 重設密碼
   * @param req
   * @param res
   * @returns
   */
  @MyCustomActionFilter(new LogActionFilter())
  public async ResetPassword(req: Request, res: Response): Promise<void> {
    const { account, password } = req.body;

    let user = await user_service.GetExistUserByAccountAsync(account);
    if (!user) {
      res.status(401).json({ message: "使用者名稱或密碼錯誤" });
      return;
    }

    let success = await user_service.ResetPassword(user);
    if (!success) {
      res.status(500).json({ message: "密碼重設失敗" });
      return;
    }

    res.apiSuccess({}, "修改完成");
  }
}

export default new UserController();
