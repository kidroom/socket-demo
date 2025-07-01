import { TryParseJwt } from "../libs/jwt_helper";
import chat_repository from "../repositories/chat_repository";

class ChatService {
  async GetRoomListAsync(token: string): Promise<{} | null> {
    const verifiedPayload = TryParseJwt(token);
    if (!verifiedPayload) {
      return null;
    }

    const rooms = await chat_repository.GetRoomListAsync(
      verifiedPayload.userId
    );
    if (rooms && rooms.length <= 0) {
      return null;
    }

    const result = rooms?.map((item) => ({
      room_id: item.room_id,
      room_name: item.chat_room?.room_name,
    }));

    return { rooms: result };
  }

  async GetChatRoomRecordAsync(
    token: string,
    room_id: string
  ): Promise<{} | null> {
    const verifiedPayload = TryParseJwt(token);
    if (!verifiedPayload) {
      return null;
    }

    const records = await chat_repository.GetChatContentAsync(room_id);
    if (records && records.length <= 0) {
      return null;
    }

    const result = records?.map((item) => ({
      room_id: item.room_id,
      user_id: item.user_id,
      user_name: item.user?.name,
      sender: item.user_id == verifiedPayload.userId,
      sort: item.sort,
      message: item.message,
      create_date: item.createdAt,
    }));

    return { messages: result ?? null };
  }
}

export default new ChatService();
