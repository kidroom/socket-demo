import { Kafka, Producer, ProducerRecord } from 'kafkajs';
import dotenv from 'dotenv';
import logger from '../utils/logger';

// 載入環境變數
dotenv.config({ path: "../../.env" });

class KafkaProducer {
    private producer: Producer;
    private static instance: KafkaProducer;

    private constructor() {
        const kafka = new Kafka({
            clientId: 'websocket-demo',
            brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
        });

        this.producer = kafka.producer();
    }

    public static getInstance(): KafkaProducer {
        if (!KafkaProducer.instance) {
            KafkaProducer.instance = new KafkaProducer();
        }
        return KafkaProducer.instance;
    }

    public async connect(): Promise<void> {
        try {
            await this.producer.connect();
            logger.info('Kafka Producer 已連接');
        } catch (error) {
            logger.error('Kafka Producer 連接錯誤:', error);
            throw error;
        }
    }

    public async sendMessage(topic: string, message: any): Promise<void> {
        try {
            const record: ProducerRecord = {
                topic,
                messages: [
                    { value: JSON.stringify(message) },
                ],
            };
            
            await this.producer.send(record);
            logger.info(`訊息已發送到 Kafka 主題 ${topic}`);
        } catch (error) {
            logger.error('發送訊息到 Kafka 時出錯:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await this.producer.disconnect();
            logger.info('Kafka Producer 已斷開連接');
        } catch (error) {
            logger.error('斷開 Kafka Producer 連接時出錯:', error);
            throw error;
        }
    }
}

export default KafkaProducer;
