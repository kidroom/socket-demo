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
  public async GetRoomListAsync(req: Request, res: Response): Promise<void> {
    const cookies = req.cookies;
    const rooms = await chatS_service.GetRoomListAsync(cookies["token"]);

    res.apiSuccess(rooms);
  }

  /** 取得聊天內容
   * @param req
   * @param res
   */
  @MyCustomActionFilter(new AuthFilter())
  @MyCustomActionFilter(new LogActionFilter())
  public async GetChatRoomRecordAsync(
    req: Request,
    res: Response
  ): Promise<void> {
    const cookies = req.cookies;
    const { room_id } = req.body;
    const records = await chatS_service.GetChatRoomRecordAsync(
      cookies["token"],
      room_id
    );

    res.apiSuccess(records);
  }
}

export default new ChatController();
