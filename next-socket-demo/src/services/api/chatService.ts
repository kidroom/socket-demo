import { apiClient } from "@/utils/apiClient";

// Types
export interface ChatRoom {
  room_id: string;
  room_name: string;
}

export interface ChatMessage {
  user_id: string;
  user_name: string;
  room_id: string;
  sender: boolean;
  sort: number;
  message: string;
  create_date: Date;
}

export interface GetRoomListResponse {
  rooms: ChatRoom[];
}

export interface GetChatRecordsRequest {
  room_id: string;
  limit?: number;
  before?: string; // timestamp
}

export interface GetChatRecordsResponse {
  messages: ChatMessage[];
  hasMore: boolean;
}

/**
 * Chat service for handling chat-related operations
 */
export const chatService = {
  /**
   * Get list of available chat rooms
   * @returns List of chat rooms
   */
  getRoomList: async (): Promise<GetRoomListResponse> => {
    try {
      console.log("[getRoomList] Fetching chat room list");
      const response = await apiClient.get<GetRoomListResponse>(
        "/chat/get_room_list"
      );
      console.log(
        `[getRoomList] Successfully fetched ${JSON.stringify(response.data)} `
      );
      return response.data!;
    } catch (error) {
      console.error("[getRoomList] Failed to fetch chat room list:", error);
      throw error;
    }
  },

  /**
   * Get chat records for a specific room
   * @param roomId ID of the chat room
   * @param limit Maximum number of messages to return
   * @param before Fetch messages before this timestamp for pagination
   * @returns Chat messages and pagination info
   */
  getChatRecords: async (
    roomId: string,
    limit?: number,
    before?: string
  ): Promise<GetChatRecordsResponse> => {
    try {
      console.log(`[getChatRecords] Fetching messages for room: ${roomId}`);
      const params: GetChatRecordsRequest = { room_id: roomId };

      if (limit) {
        params.limit = limit;
        console.log(`[getChatRecords] Limiting to ${limit} messages`);
      }

      if (before) {
        params.before = before;
        console.log(`[getChatRecords] Fetching messages before: ${before}`);
      }

      const response = await apiClient.post<GetChatRecordsResponse>(
        "/chat/get_chat_record",
        params
      );
      console.log(
        `[getChatRecords] Successfully fetched ${
          response.data?.messages?.length || 0
        } messages`
      );
      return response.data!;
    } catch (error) {
      console.error(
        `[getChatRecords] Failed to fetch messages for room ${roomId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Send a message to a chat room
   * @param roomId ID of the chat room
   * @param message Message content
   */
  sendMessage: async (roomId: string, message: string): Promise<void> => {
    try {
      console.log(`[sendMessage] Sending message to room: ${roomId}`);
      await apiClient.post("/chat/send_message", {
        room_id: roomId,
        message: message,
      });
      console.log("[sendMessage] Message sent successfully");
    } catch (error) {
      console.error(
        `[sendMessage] Failed to send message to room ${roomId}:`,
        error
      );
      throw error;
    }
  },
};
