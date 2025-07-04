import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// 確保日誌目錄存在
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 定義日誌級別和顏色
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 定義日誌級別對應的顏色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// 添加顏色到 winston
winston.addColors(colors);

// 定義日誌格式
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`,
  ),
);

// 定義不同級別的日誌傳輸方式
const transports = [
  // 控制台輸出
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      format,
    ),
  }),
  // 錯誤日誌文件
  new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'error/error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
  }),
  // 所有日誌文件
  new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'all/all-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

// 創建日誌實例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false, // 日誌記錄失敗時不退出進程
});

// 處理未捕獲的異常
process.on('unhandledRejection', (reason) => {
  logger.error(`未處理的 Promise 拒絕: ${reason}`);
});

process.on('uncaughtException', (error) => {
  logger.error(`未捕獲的異常: ${error.message}`, { error });
  process.exit(1);
});

// 創建一個請求日誌中間件
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
      {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      }
    );
  });

  next();
};

export default logger;
