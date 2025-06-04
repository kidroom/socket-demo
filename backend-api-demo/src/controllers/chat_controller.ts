import { Request, Response } from "express";
import chatService from "../services/chat_service";
import { MyCustomActionFilter, AuthFilter } from "../libs/filter";

class ChatController {
  /** 取得使用者聊天列表
   * @param req
   * @param res
   */
  //@MyCustomActionFilter(new AuthFilter())
  public async GetRoomList(req: Request, res: Response): Promise<void> {
    const cookies = req.cookies;
    const rooms = await chatService.GetRoomList(cookies["token"]);

    res.status(200).json({ message: "成功", data: rooms });
  }

  public async GetChatRoomRecord(req: Request, res: Response): Promise<void> {
    const cookies = req.cookies;
    const { room_id } = req.body;
    const records = await chatService.GetChatRoomRecord(
      cookies["token"],
      room_id
    );

    res.status(200).json({ message: "成功", data: records });
  }
}

export default new ChatController();
