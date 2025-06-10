export interface ChatMessageModel {
  id?: string | number;
  sender: string | number;
  senderName?: string;
  receive?: string;
  content: string;
  timestamp?: string | Date;
  isCurrentUser?: boolean;
  roomId?: string;
}

export interface RoomMessageData {
  roomId: string;
  sender: string | number;
  senderName: string;
  content: string;
  timestamp?: string;
}
