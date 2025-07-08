export interface ChatMessageModel {
  sender: string;
  receive: string;
  content: string;
}

export interface SocketEventHandlers {
  onMessage?: (message: ChatMessageModel) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

// 擴展 Socket 類型定義
declare module 'socket.io-client' {
  interface Socket {
    // 可以在這裡添加自定義的 socket 方法
  }
}
