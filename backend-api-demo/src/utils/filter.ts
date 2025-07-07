import { Request, Response, NextFunction } from "express";
import auth_service from "../services/auth_service";
import logger from "./logger";

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
            logger.error(
              `[MyCustomActionFilter - ${propertyKey}] Headers already sent BEFORE calling originalMethod. Route: ${req.originalUrl}, Filter: ${filterInstance.constructor.name}`
            );
            // Depending on desired behavior, you might return here to prevent calling originalMethod
            // return;
          }
          await originalMethod
            .apply(this, [req, res, next])
            .then(async () => {
              // 在 Action 執行後
              if (res.headersSent && filterInstance.onActionExecuted) {
                logger.error(
                  `[MyCustomActionFilter - ${propertyKey}] Headers already sent BEFORE onActionExecuted. Route: ${req.originalUrl}, Filter: ${filterInstance.constructor.name}. Skipping onActionExecuted.`
                );
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
        if (res.headersSent) {
          // Also check here if no onActionExecuting
          logger.error(
            `[MyCustomActionFilter - ${propertyKey}] Headers already sent BEFORE calling originalMethod (no onActionExecuting). Route: ${req.originalUrl}`
          );
        }
        await originalMethod
          .apply(this, [req, res, next])
          .then(async () => {
            if (res.headersSent && filterInstance.onActionExecuted) {
              // And here
              logger.error(
                `[MyCustomActionFilter - ${propertyKey}] Headers already sent BEFORE onActionExecuted (no onActionExecuting). Route: ${req.originalUrl}. Skipping onActionExecuted.`
              );
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

/** 身分驗證
 */
export class AuthFilter extends ActionFilterBase {
  async onActionExecuting(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const authHeader = req.headers.authorization;
    const user_agent = req.headers["user-agent"];

    logger.info(`AuthFilter - Request Headers: ${JSON.stringify(req.headers)}`);
    logger.info(`AuthFilter - User Agent: ${user_agent}`);

    // Check for Bearer token in Authorization header
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      logger.info(`AuthFilter: Found token in Authorization header`);

      try {
        if (await auth_service.CheckTokenAsync(token, user_agent)) {
          logger.info("AuthFilter: Token validated successfully");
          next();
          return;
        } else {
          logger.info("AuthFilter: Token validation failed");
          res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid or expired token",
          });
          return;
        }
      } catch (error) {
        logger.error("AuthFilter: Error validating token:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error during authentication",
        });
        return;
      }
    }

    // Fallback to check cookies (for backward compatibility if needed)
    const cookies = req.cookies;
    if (cookies && cookies.token) {
      logger.info("AuthFilter: Found token in cookies");
      if (await auth_service.CheckTokenAsync(cookies.token, user_agent)) {
        logger.info("AuthFilter: Cookie token validated");
        next();
        return;
      }
    }

    // No valid token found
    logger.info("AuthFilter: No valid authentication token found");
    res.status(401).json({
      success: false,
      message: "Unauthorized: No valid authentication token provided",
    });
  }

  async onActionExecuted(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    logger.info("AuthFilter: Action executed.");
    next();
  }
}

/** 日誌記錄
 */
export class LogActionFilter extends ActionFilterBase {
  async onActionExecuting(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const startTime = Date.now();
    (req as any)._startTime = startTime; // 將開始時間儲存在 req 物件上
    logger.info(
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
    logger.info(
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
    logger.info("ErrorHandlingFilter: Action executed (or attempted).");
    next();
  }
}
