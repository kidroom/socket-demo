import { KafkaMessage } from 'kafkajs';
import { consumerService } from '../utils/consumer';
import messageService from '../services/message_service';
import logger from '../utils/logger';
import { CHAT_MESSAGE_TOPIC } from '../consts/kafka_conts';

class ChatMessageJob {
  private isRunning: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // 註冊處理器
    consumerService.registerHandler(
      CHAT_MESSAGE_TOPIC,
      this.processMessage.bind(this)
    );
    
    logger.info('ChatMessageJob 已初始化');
  }

  /**
   * 處理聊天訊息
   */
  private async processMessage(message: KafkaMessage): Promise<void> {
    try {
      // 使用 MessageService 處理訊息，並傳入主題信息
      await messageService.processKafkaMessage(message, CHAT_MESSAGE_TOPIC);
      logger.info(`聊天訊息處理完成 (offset: ${message.offset})`);
    } catch (error) {
      logger.error('處理聊天訊息時出錯:', error);
      throw error; // 拋出錯誤以便重試機制處理
    }
  }

  /**
   * 啟動任務
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('ChatMessageJob 已經在運行中');
      return;
    }

    try {
      await consumerService.connect();
      await consumerService.subscribe([CHAT_MESSAGE_TOPIC]);
      
      this.isRunning = true;
      logger.info(`ChatMessageJob 已啟動，正在監聽主題: ${CHAT_MESSAGE_TOPIC}`);
    } catch (error) {
      this.isRunning = false;
      logger.error('啟動 ChatMessageJob 失敗:', error);
      throw error;
    }
  }

  /**
   * 停止任務
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      await consumerService.onShutdown();
      this.isRunning = false;
      logger.info('ChatMessageJob 已停止');
    } catch (error) {
      logger.error('停止 ChatMessageJob 時出錯:', error);
      throw error;
    }
  }
}

// 導出單例實例
const chatMessageJob = new ChatMessageJob();
export default chatMessageJob;
