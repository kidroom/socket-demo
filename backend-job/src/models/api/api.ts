// Base API response type that matches the backend format
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code?: string | number;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Standard error response
export interface ApiError extends Error {
  response?: {
    data: {
      success: boolean;
      message: string;
      error?: {
        code?: string | number;
        message: string;
        details?: any;
      };
    };
    status: number;
    statusText: string;
  };
}

// Helper type for API functions
export type ApiFunction<T = any, P = any> = (params?: P) => Promise<ApiResponse<T>>;
