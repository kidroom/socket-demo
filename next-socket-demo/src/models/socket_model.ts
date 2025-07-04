export interface ChatMessageModel {
  roomId: string;
  sender: boolean;
  senderId: string;
  senderName: string;
  receive: string;
  content: string;
  timestamp: string | Date;
  sort: number;
}

export interface RoomMessageData {
  roomId: string;
  sender: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}
