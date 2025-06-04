import { TryParseJwt } from "../libs/jwt_helper";
import chat_repository from "../repositories/chat_repository";

class ChatService {
  async GetRoomList(token: string): Promise<any[] | null> {
    const verifiedPayload = TryParseJwt(token);
    if (!verifiedPayload) {
      return null;
    }
    const rooms = await chat_repository.GetRoomList(verifiedPayload.userId);
    if (rooms && rooms.length <= 0) {
      return null;
    }
    const result = rooms?.map((item) => ({
      room_id: item.room_id,
      room_name: item.chat_room?.room_name,
    }));

    return result ?? null;
  }

  async GetChatRoomRecord(token: string, room_id: string) {
    const verifiedPayload = TryParseJwt(token);
    if (!verifiedPayload) {
      return null;
    }

    const records = await chat_repository.GetChatContent(room_id);
    if (records && records.length <= 0) {
      return null;
    }

    const result = records?.map((item) => ({
      room_id: item.room_id,
      user_id: item.user_id,
      sender: item.user_id == verifiedPayload.userId ? 1 : 2,
      sort: item.sort,
      message: item.message,
      create_date: item.createdAt,
    }));

    return result ?? null;
  }
}

export default new ChatService();
