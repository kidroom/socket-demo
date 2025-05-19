import { Request, Response } from "express";
import userService from "../services/user_service";

const secretKey =
  "18bfaf64981d6ff162af44be0ae4086451b57b6f065343c862669963ae99aefd"; // 應使用 .env 儲存金鑰

class ChatController {
  /** 取得使用者聊天列表
   * @param req
   * @param res
   */
  public async GetRoomList(req: Request, res: Response): Promise<void> {
    const { userId } = req.body;

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
    if (await userService.CheckTokenAsync(cookies["token"])) {
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

    const token = await userService.SetTokenAsync(user.id, user_agent);

    res.cookie("token", token, {
      expires: new Date(Date.now() + 1 * 360000),
      httpOnly: true,
    });

    res.json({ message: token });
  }
}

export default new ChatController();
