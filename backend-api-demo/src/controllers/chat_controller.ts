import { Request, Response } from "express";
import chatS_service from "../services/chat_service";
import {
  MyCustomActionFilter,
  AuthFilter,
  LogActionFilter,
} from "../libs/filter";

class ChatController {
  /** 取得使用者聊天列表
   * @param req
   * @param res
   */
  @MyCustomActionFilter(new AuthFilter())
  @MyCustomActionFilter(new LogActionFilter())
  public async GetRoomList(req: Request, res: Response): Promise<void> {
    const cookies = req.cookies;
    const rooms = await chatS_service.GetRoomList(cookies["token"]);

    res.status(200).json({ message: "成功", data: rooms });
  }

  /** 取得聊天內容
   * @param req
   * @param res
   */
  @MyCustomActionFilter(new AuthFilter())
  @MyCustomActionFilter(new LogActionFilter())
  public async GetChatRoomRecord(req: Request, res: Response): Promise<void> {
    const cookies = req.cookies;
    const { room_id } = req.body;
    const records = await chatS_service.GetChatRoomRecord(
      cookies["token"],
      room_id
    );

    res.status(200).json({ message: "成功", data: records });
  }
}

export default new ChatController();
