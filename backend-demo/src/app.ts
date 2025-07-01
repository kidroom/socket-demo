import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user_route";
import chatRoute from "./routes/chat_route";
import { apiResponseHandler } from "./middlewares/api_response_middleware";
import logger, { requestLogger } from "./libs/logger";

class App {
  public app: Application;

  constructor(port?: number) {
    this.app = express();
    this.middleware();
    this.routes();
    // this.exception_handle();
  }

  private middleware(): void {
    // 添加請求日誌中間件
    this.app.use(requestLogger);
    
    // 定義允許的來源列表
    const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
    this.app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // 允許的 HTTP 方法
        credentials: true, // <--- 允許發送和接收 cookies/Authorization headers 等 credentials
        optionsSuccessStatus: 200, // 預檢請求的成功狀態碼
        allowedHeaders: [
          "Origin",
          "X-Requested-With",
          "Content-Type",
          "Accept",
          "Authorization",
          "Cookie",
        ],
      })
    );
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(apiResponseHandler);
  }

  private routes(): void {
    this.app.use("/api/user", userRoute);
    this.app.use("/api/chat", chatRoute);
    // 可以在這裡註冊更多的路由
  }

  /** 錯誤處理中介層，捕獲所有未被處理的錯誤
   */
  private exception_handle(): void {
    // 404 處理
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.warn(`路由不存在: ${req.method} ${req.originalUrl}`);
      res.apiError("API 路由不存在", 404, "NOT_FOUND");
    });

    // 全局錯誤處理
    this.app.use(
      (err: any, req: Request, res: Response, next: NextFunction) => {
        logger.error(`發生未處理的錯誤: ${err.message}`, { 
          error: err.stack,
          url: req.originalUrl,
          method: req.method,
          body: req.body,
          params: req.params,
          query: req.query
        });
        
        // 使用統一的錯誤響應格式
        const errorMessage = process.env.NODE_ENV === "production" 
          ? "伺服器內部錯誤" 
          : err.message;
          
        const errorDetails = process.env.NODE_ENV === "development"
          ? [{ field: 'stack', message: err.stack }]
          : undefined;
          
        res.apiError(
          errorMessage,
          500,
          "INTERNAL_SERVER_ERROR",
          errorDetails
        );
      }
    );
  }

  public listen(port: number, callback: () => void): void {
    this.app.listen(port, callback);
  }

  public getApp(): Application {
    return this.app;
  }
}

export default new App().getApp();
