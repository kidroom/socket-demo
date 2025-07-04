import 'dotenv/config';
import chatMessageJob from './jobs/chat_message_job';
import logger from './utils/logger';

// 處理未捕獲的異常
process.on('uncaughtException', (error: Error) => {
  logger.error('未捕獲的異常:', error);
  process.exit(1);
});

// 處理未處理的 Promise 拒絕
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('未處理的 Promise 拒絕:', reason);
  process.exit(1);
});

// 處理進程信號
const shutdown = async (signal: string) => {
  logger.info(`收到 ${signal} 信號，正在關閉應用...`);
  
  try {
    // 在這裡添加其他需要清理的資源
    // 例如：關閉數據庫連接、停止定時任務等
    
    logger.info('應用已正常關閉');
    process.exit(0);
  } catch (error) {
    logger.error('關閉應用時出錯:', error);
    process.exit(1);
  }
};

// 註冊信號處理器
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => shutdown(signal));
});

// 啟動應用
const start = async () => {
  try {
    await chatMessageJob.start();
    logger.info('聊天訊息處理服務已啟動');
  } catch (error) {
    logger.error('啟動服務時出錯:', error);
    process.exit(1);
  }
};

start();
