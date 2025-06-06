import { Request, Response, NextFunction } from "express";
import auth_service from "../services/auth_service";

// 定義 Action Filter 的介面
interface IActionFilter {
  onActionExecuting?(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  onActionExecuted?(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}

// 基礎 Action Filter 類別 (可選，提供一個範本)
abstract class ActionFilterBase implements IActionFilter {
  // 預設為空實現，子類可覆寫
  async onActionExecuting(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    next();
  }
  async onActionExecuted(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    next();
  }
}

// ------------------- 實際的 Decorator -------------------

export function MyCustomActionFilter(filterInstance: IActionFilter) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value; // 保存原始的 Action 方法

    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      // 在 Action 執行前
      if (filterInstance.onActionExecuting) {
        await filterInstance.onActionExecuting(req, res, async () => {
          // next() 被呼叫後才執行原始方法
          if (res.headersSent) {
            console.error(`[MyCustomActionFilter - ${propertyKey}] Headers already sent BEFORE calling originalMethod. Route: ${req.originalUrl}, Filter: ${filterInstance.constructor.name}`);
            // Depending on desired behavior, you might return here to prevent calling originalMethod
            // return; 
          }
          await originalMethod
            .apply(this, [req, res, next])
            .then(async () => {
              // 在 Action 執行後
              if (res.headersSent && filterInstance.onActionExecuted) {
                console.log(`[MyCustomActionFilter - ${propertyKey}] Headers already sent BEFORE onActionExecuted. Route: ${req.originalUrl}, Filter: ${filterInstance.constructor.name}. Skipping onActionExecuted.`);
              }
              if (filterInstance.onActionExecuted) {
                // Pass a dummy next to prevent express from continuing the middleware chain after the response
                await filterInstance.onActionExecuted(req, res, () => {});
              }
            })
            .catch((err: Error) => {
              next(err); // 捕獲原始方法中的錯誤並傳遞給下一個中介層
            });
        });
      } else {
        // 如果沒有 onActionExecuting，直接執行原始方法
        if (res.headersSent) { // Also check here if no onActionExecuting
            console.error(`[MyCustomActionFilter - ${propertyKey}] Headers already sent BEFORE calling originalMethod (no onActionExecuting). Route: ${req.originalUrl}`);
        }
        await originalMethod
          .apply(this, [req, res, next])
          .then(async () => {
            if (res.headersSent && filterInstance.onActionExecuted) { // And here
                console.log(`[MyCustomActionFilter - ${propertyKey}] Headers already sent BEFORE onActionExecuted (no onActionExecuting). Route: ${req.originalUrl}. Skipping onActionExecuted.`);
            }
            if (filterInstance.onActionExecuted) {
              // Pass a dummy next to prevent express from continuing the middleware chain after the response
              await filterInstance.onActionExecuted(req, res, () => {});
            }
          })
          .catch((err: Error) => {
            next(err);
          });
      }
    };

    return descriptor;
  };
}

// ------------------- 範例 Action Filter 實作 -------------------

// 1. 驗證身分驗證的 Filter
export class AuthFilter extends ActionFilterBase {
  async onActionExecuting(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const cookies = req.cookies;
    const user_agent = req.headers["user-agent"];
    console.log(`AuthFilter cookie: ${JSON.stringify(cookies)}`);
    console.log(`AuthFilter origin cookie: ${JSON.stringify(cookies)}`);
    console.log(`AuthFilter token: ${cookies.token}`);
    console.log(`AuthFilter user_agent: ${user_agent}`);
    if (cookies["token"]) {
      if (await auth_service.CheckTokenAsync(cookies["token"], user_agent)) {
        console.log("AuthFilter: Token Validated");
        next();
      } else {
        console.log("AuthFilter: Invalid Token");
        res.status(401).send("Unauthorized: Invalid Token");
        return;
      }
    } else {
      console.log("AuthFilter: No Token Provided");
      res.status(401).send("Unauthorized: No Token");
      return;
    }
  }

  async onActionExecuted(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    console.log("AuthFilter: Action executed.");
    next();
  }
}

// 2. 日誌記錄的 Filter
export class LogActionFilter extends ActionFilterBase {
  async onActionExecuting(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const startTime = Date.now();
    (req as any)._startTime = startTime; // 將開始時間儲存在 req 物件上
    console.log(
      `LogActionFilter: Request started at ${new Date(
        startTime
      ).toISOString()} for ${req.method} ${req.path}`
    );
    next();
  }

  async onActionExecuted(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const endTime = Date.now();
    const duration = endTime - (req as any)._startTime;
    console.log(
      `LogActionFilter: Request for ${req.method} ${req.path} finished in ${duration}ms`
    );
    next();
  }
}

export class ErrorHandlingFilter extends ActionFilterBase {
  async onActionExecuted(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    console.log("ErrorHandlingFilter: Action executed (or attempted).");
    next();
  }
}
