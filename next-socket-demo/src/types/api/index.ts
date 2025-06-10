// Common response type for all API responses
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  timestamp: string;
  errorCode?: string;
  errors?: Array<{ field?: string; message: string }>;
}

// Auth types
export interface LoginRequest {
  account: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  user: {
    id: number;
    account: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
}

// Chat types
export interface ChatRoom {
  room_id: string;
  room_name: string;
}

export interface ChatMessage {
  room_id: string;
  user_id: string;
  sender: number; // 1 for self, 2 for others
  sort: number;
  message: string;
  create_date: string;
}

export interface GetRoomListResponse {
  rooms: ChatRoom[];
}

export interface GetChatRecordsRequest {
  room_id: string;
}

export interface GetChatRecordsResponse {
  messages: ChatMessage[];
}

// User types
export interface UserProfile {
  id: number;
  account: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: number;
  createdAt: string;
  updatedAt: string;
}
