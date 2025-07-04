export interface MessagePayload {
  topic: string;
  key?: string | null;
  value: any;
  timestamp: string;
  headers?: Record<string, any>;
}

export interface ChatMessage {
    roomId: string;
    senderId: string;
    sort: number;
    content: string;
    timestamp: string;
    receivedAt: string;
}