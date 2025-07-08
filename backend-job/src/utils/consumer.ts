import { Kafka, Consumer, EachMessagePayload, KafkaMessage } from 'kafkajs';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

class ConsumerService {
  private kafka: Kafka;
  private consumer: Consumer;
  private isConnected: boolean = false;
  private messageHandlers: Map<string, (message: KafkaMessage) => Promise<void>> = new Map();

  constructor() {
    this.kafka = new Kafka({
      clientId: 'kafka-job-consumer',
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    });

    this.consumer = this.kafka.consumer({
      groupId: process.env.KAFKA_GROUP_ID || 'kafka-job-consumer-group',
    });
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      await this.consumer.connect();
      this.isConnected = true;
      logger.info('Kafka 消費者已連接');
    } catch (error) {
      logger.error('Kafka 連接錯誤:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.consumer.disconnect();
      this.isConnected = false;
      logger.info('Kafka 消費者已斷開連接');
    } catch (error) {
      logger.error('Kafka 斷開連接錯誤:', error);
      throw error;
    }
  }

  public async subscribe(
    topics: string | string[], 
    options: { fromBeginning?: boolean } = { fromBeginning: true }
  ): Promise<void> {
    const topicArray = Array.isArray(topics) ? topics : [topics];
    
    try {
      // 如果 fromBeginning 為 true，則從最早的 offset 開始消費
      // 如果為 false 或未指定，則從上次提交的 offset 開始消費
      await this.consumer.subscribe({ 
        topics: topicArray, 
        fromBeginning: options.fromBeginning 
      });
      
      // 確保 consumer 組的 offset 被正確管理
      await this.consumer.run({
        autoCommit: true,
        autoCommitInterval: 5000, // 每 5 秒自動提交一次 offset
        autoCommitThreshold: 100, // 每處理 100 條消息自動提交一次 offset
        eachMessage: async (payload: EachMessagePayload) => {
          const { topic, partition, message } = payload;
          const handler = this.messageHandlers.get(topic);

          if (handler) {
            try {
              await handler(message);
            } catch (error) {
              logger.error(`處理消息時出錯 (topic: ${topic}, partition: ${partition}):`, error);
            }
          } else {
            logger.warn(`沒有找到對應的處理器 (topic: ${topic})`);
          }
        },
      });
      
      logger.info(`已訂閱主題: ${topicArray.join(', ')}, fromBeginning: ${options.fromBeginning}`);
    } catch (error) {
      logger.error('訂閱主題錯誤:', error);
      throw error;
    }
  }

  public registerHandler(topic: string, handler: (message: KafkaMessage) => Promise<void>): void {
    this.messageHandlers.set(topic, handler);
    logger.info(`已註冊處理器 (topic: ${topic})`);
  }

  public async onShutdown(): Promise<void> {
    await this.disconnect();
  }
}

export const consumerService = new ConsumerService();
