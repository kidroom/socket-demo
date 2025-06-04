import { Request, Response, NextFunction } from "express";

// 定義 Action Filter 的介面
interface IActionFilter {
  onActionExecuting?(req: Request, res: Response, next: NextFunction): void;
  onActionExecuted?(req: Request, res: Response, next: NextFunction): void;
}

// 基礎 Action Filter 類別 (可選，提供一個範本)
abstract class ActionFilterBase implements IActionFilter {
  // 預設為空實現，子類可覆寫
  onActionExecuting(req: Request, res: Response, next: NextFunction): void {
    next();
  }
  onActionExecuted(req: Request, res: Response, next: NextFunction): void {
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
        filterInstance.onActionExecuting(req, res, () => {
          // next() 被呼叫後才執行原始方法
          originalMethod
            .apply(this, [req, res, next])
            .then(() => {
              // 在 Action 執行後
              if (filterInstance.onActionExecuted) {
                filterInstance.onActionExecuted(req, res, next);
              }
            })
            .catch((err: Error) => {
              next(err); // 捕獲原始方法中的錯誤並傳遞給下一個中介層
            });
        });
      } else {
        // 如果沒有 onActionExecuting，直接執行原始方法
        originalMethod
          .apply(this, [req, res, next])
          .then(() => {
            if (filterInstance.onActionExecuted) {
              filterInstance.onActionExecuted(req, res, next);
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
  onActionExecuting(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token === "my-secret-token") {
        // 簡單的 token 驗證
        console.log("AuthFilter: Token Validated");
        next(); // 繼續執行 Action
      } else {
        console.log("AuthFilter: Invalid Token");
        res.status(401).send("Unauthorized: Invalid Token");
      }
    } else {
      console.log("AuthFilter: No Token Provided");
      res.status(401).send("Unauthorized: No Token");
    }
  }

  onActionExecuted(req: Request, res: Response, next: NextFunction): void {
    console.log("AuthFilter: Action executed.");
    next();
  }
}

// 2. 日誌記錄的 Filter
export class LogActionFilter extends ActionFilterBase {
  onActionExecuting(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    (req as any)._startTime = startTime; // 將開始時間儲存在 req 物件上
    console.log(
      `LogActionFilter: Request started at ${new Date(
        startTime
      ).toISOString()} for ${req.method} ${req.path}`
    );
    next();
  }

  onActionExecuted(req: Request, res: Response, next: NextFunction): void {
    const endTime = Date.now();
    const duration = endTime - (req as any)._startTime;
    console.log(
      `LogActionFilter: Request for ${req.method} ${req.path} finished in ${duration}ms`
    );
    next();
  }
}

// 3. 處理錯誤的 Filter (作為 ActionFilterBase 的範例，但通常錯誤處理會放在 Express 中介層鏈的末端)
export class ErrorHandlingFilter extends ActionFilterBase {
  onActionExecuted(req: Request, res: Response, next: NextFunction): void {
    // 這個方法在 Action 執行後被調用。
    // 如果 Action 中發生了錯誤，通常會被 Express 的錯誤處理中介層捕獲。
    // 這個 filter 可以在這裡做一些收尾工作，但實際的錯誤響應通常在更通用的錯誤中介層處理。
    console.log("ErrorHandlingFilter: Action executed (or attempted).");
    next();
  }
}
