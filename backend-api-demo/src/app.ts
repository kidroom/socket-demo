import express, { Application } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user_route";
import { authenticateToken } from "./middlewares/authMiddleware"; // 假設你創建了一個 authMiddleware.ts

class App {
  public app: Application;

  constructor(port?: number) {
    this.app = express();
    this.middleware();
    this.routes();
  }

  private middleware(): void {
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private routes(): void {
    this.app.use("/api/user", userRoutes);
    // 可以在這裡註冊更多的路由
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
