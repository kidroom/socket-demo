import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user_route";
import chatRoute from "./routes/chat_route";
import { authenticateToken } from "./middlewares/authMiddleware"; // 假設你創建了一個 authMiddleware.ts

class App {
  public app: Application;

  constructor(port?: number) {
    this.app = express();
    this.middleware();
    this.routes();
    this.exception_handle();
  }

  private middleware(): void {
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
  }

  private routes(): void {
    this.app.use("/api/user", userRoute);
    this.app.use("/api/chat", chatRoute);
    // 可以在這裡註冊更多的路由
  }

  private exception_handle(): void {
    // 錯誤處理中介層 (非常重要，捕獲所有未被處理的錯誤)
    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error("Global Error Handler:", err.stack);
        res.status(500).send("Something broke!");
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
export { authenticateToken }; // 導出中介層
