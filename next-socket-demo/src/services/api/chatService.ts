import { apiClient } from '@/utils/apiClient';
import { GetRoomListResponse, GetChatRecordsRequest, GetChatRecordsResponse } from '@/types/api';

export const chatService = {
  // 取得聊天室列表
  getRoomList: async (): Promise<GetRoomListResponse> => {
    return apiClient.get<GetRoomListResponse>('/chat/get_room_list');
  },

  // 取得聊天室訊息記錄
  getChatRecords: async (roomId: string): Promise<GetChatRecordsResponse> => {
    return apiClient.post<GetChatRecordsResponse>('/chat/get_chat_record', { room_id: roomId });
  },

  // 傳送訊息
  sendMessage: async (roomId: string, message: string): Promise<void> => {
    return apiClient.post('/chat/send_message', {
      room_id: roomId,
      message: message
    });
  }
};
