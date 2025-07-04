import { KafkaMessage } from 'kafkajs';
import logger from '../utils/logger';
import ApiClient from '../utils/api_client';

interface MessagePayload {
  topic: string;
  key?: string | null;
  value: any;
  timestamp: string;
  headers?: Record<string, any>;
}

class MessageService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient({});
  }

  /**
   * 處理從 Kafka 接收到的訊息
   */
  public async processKafkaMessage(message: KafkaMessage, topic?: string): Promise<void> {
    try {
      // 解析訊息值
      const value = message.value ? JSON.parse(message.value.toString()) : null;
      
      // 建立標準化的訊息負載
      const payload: MessagePayload = {
        topic: topic || 'unknown-topic',
        key: message.key?.toString(),
        value,
        timestamp: message.timestamp || new Date().toISOString(),
        headers: message.headers ? this.parseHeaders(message.headers) : undefined,
      };

      logger.info(`處理訊息: ${JSON.stringify(payload)}`);
      
      // 根據主題決定要調用的 API 端點
      await this.forwardToBackend(payload);
      
    } catch (error) {
      logger.error('處理 Kafka 訊息時出錯:', error);
      throw error;
    }
  }

  /**
   * 將訊息轉發到後端 API
   */
  private async forwardToBackend(payload: MessagePayload): Promise<void> {
    try {
      // 根據主題決定要調用的端點
      let endpoint = '';
      
      switch (payload.topic) {
        case 'chat-messages':
          endpoint = '/api/chat/save_message';
          break;
        // 可以根據需要添加更多主題的處理
        default:
          logger.error('topic 未建置對應 api');
          return;
      }

      const response = await this.apiClient.post<MessagePayload>(endpoint, payload);
      logger.info(`成功轉發訊息到後端: ${JSON.stringify(response)}`);
      
    } catch (error) {
      logger.error('轉發訊息到後端時出錯:', error);
      // 可以在這裡實現重試邏輯
      throw error;
    }
  }

  /**
   * 解析 Kafka 訊息標頭
   */
  private parseHeaders(headers: any): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(headers)) {
      if (Buffer.isBuffer(value)) {
        result[key] = value.toString();
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
}

export default new MessageService();
