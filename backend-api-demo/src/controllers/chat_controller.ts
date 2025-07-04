import { Request, Response } from "express";
import chatS_service from "../services/chat_service";
import {
  MyCustomActionFilter,
  AuthFilter,
  LogActionFilter,
} from "../utils/filter";
import { GetToken } from "../utils/http_helper";
import { MessagePayload } from "../models/chat_request";

class ChatController {
  /** 取得使用者聊天列表
   * @param req
   * @param res
   */
  @MyCustomActionFilter(new AuthFilter())
  @MyCustomActionFilter(new LogActionFilter())
  public async GetRoomListAsync(req: Request, res: Response): Promise<void> {
    const token = GetToken(req);
    const rooms = await chatS_service.GetRoomListAsync(token!);

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
    const token = GetToken(req);
    const { room_id } = req.body;
    const records = await chatS_service.GetChatRoomRecordAsync(token!, room_id);

    res.apiSuccess(records);
  }

  /** 取得聊天內容
   * @param req
   * @param res
   */
  @MyCustomActionFilter(new LogActionFilter())
  public async SaveMessageAsync(
    req: Request,
    res: Response
  ): Promise<void> {
    const message = req.body as MessagePayload;
    const records = await chatS_service.SaveMessageAsync(message);

    res.apiSuccess(records);
  }
}

export default new ChatController();
