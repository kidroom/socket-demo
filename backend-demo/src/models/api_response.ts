export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T; // 成功時的數據
  errorCode?: string; // 失敗時的錯誤碼
  errors?: { field?: string; message: string }[] | null; // 失敗時的錯誤細節
  timestamp: string;
}

// 為了讓 TypeScript 識別擴展後的 res 物件
declare global {
  namespace Express {
    interface Response {
      apiSuccess<T = any>(data: T, message?: string, statusCode?: number): void;
      apiError(
        message: string,
        statusCode?: number,
        errorCode?: string,
        errors?: { field?: string; message: string }[] | null
      ): void;
    }
  }
}
