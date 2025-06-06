// src/middleware/apiResponseHandler.ts

import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../models/api_response"; // 導入介面

export const apiResponseHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /**
   * 統一的成功響應方法
   * @param data 實際返回的數據
   * @param message 成功訊息 (預設為 '操作成功')
   * @param statusCode HTTP 狀態碼 (預設為 200)
   */
  res.apiSuccess = <T = any>(
    data: T,
    message: string = "成功",
    statusCode: number = 200
  ): void => {
    if (res.headersSent) {
      console.error(
        `Error in apiSuccess: Attempted to send response when headers were already sent. Controller likely called this after response was already finalized. Message: ${message}, Current route: ${req.originalUrl}`,
        new Error().stack // Provides a stack trace for where apiSuccess was called from
      );
      // Log data if it's not too large or sensitive, or a summary of it
      // console.error(`Data: ${JSON.stringify(data)}`);
      return; // Prevent further action and the crash
    }
    const responseBody: ApiResponse<T> = {
      success: true,
      statusCode: statusCode,
      message: message,
      data: data,
      timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(responseBody);
  };

  /**
   * 統一的錯誤響應方法
   * @param message 錯誤訊息 (預設為 '操作失敗')
   * @param statusCode HTTP 狀態碼 (預設為 400)
   * @param errorCode 應用程式定義的錯誤碼
   * @param errors 錯誤細節陣列
   */
  res.apiError = (
    message: string = "失敗",
    statusCode: number = 500,
    errorCode?: string,
    errors?: { field?: string; message: string }[] | null
  ): void => {
    const responseBody: ApiResponse<null> = {
      success: false,
      statusCode: statusCode,
      message: message,
      errorCode: errorCode,
      errors: errors,
      timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(responseBody);
  };

  next(); // 繼續處理請求
};
