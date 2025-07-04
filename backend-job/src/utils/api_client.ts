import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { ApiResponse, ApiError } from "../models/api/api";
import logger from "./logger";

interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5010/api";

class ApiClient {
  private client: AxiosInstance;

  constructor(config: ApiClientConfig) {
    const { headers, baseURL, timeout, ...restConfig } = config;

    this.client = axios.create({
      baseURL:
        baseURL || process.env.BACKEND_API_URL || "http://localhost:5010",
      timeout: timeout || 10000,
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
      },
      withCredentials: true,
      ...restConfig,
    });
    this.setupInterceptors();
  }

  /**
   * 設置攔截器
   */
  private setupInterceptors(): void {
    // 請求攔截器
    this.client.interceptors.request.use(
      (config) => {
        // 可以在這裡加入認證 token 等
        // const token = getTokenFromSomewhere();
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }

        logger.debug(
          `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
          {
            method: config.method,
            url: config.url,
            data: config.data,
          }
        );

        return config;
      },
      (error) => {
        logger.error("[API Request Error]", error);
        return Promise.reject(error);
      }
    );

    // 回應攔截器
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(
          `[API Response] ${response.status} ${response.config.url}`,
          {
            status: response.status,
            data: response.data,
          }
        );
        return response;
      },
      (error) => {
        if (error.response) {
          // 服務器返回錯誤狀態碼
          logger.error("[API Response Error]", {
            status: error.response.status,
            url: error.config.url,
            data: error.response.data,
          });
        } else if (error.request) {
          // 請求已發出但未收到回應
          logger.error("[API No Response]", {
            message: error.message,
            url: error.config.url,
          });
        } else {
          // 發送請求時發生錯誤
          logger.error("[API Request Setup Error]", error);
        }
        return Promise.reject(error);
      }
    );
  }

  private async request<T>(
    config: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client({
        ...config,
        validateStatus: (status) => status >= 200 && status < 500, // Don't throw for 4xx errors
      });

      if (!response.data.success) {
        const errorMessage = response.data.message || "API request failed";
        const error: ApiError = new Error(errorMessage);
        error.response = {
          data: {
            success: false,
            message: errorMessage,
            error: {
              message: errorMessage,
              ...(response.data.error || {}),
            },
            ...(response.data.error ? { error: response.data.error } : {}),
            ...(response.data.message
              ? { message: response.data.message }
              : {}),
          },
          status: response.status,
          statusText: response.statusText,
        };
        throw error;
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiResponse>;
        const apiError: ApiError = new Error(
          axiosError.response?.data?.message ||
            axiosError.message ||
            "An unexpected error occurred"
        );
        apiError.response = {
          data: {
            success: false,
            message: apiError.message,
            error: {
              message: apiError.message,
              ...(axiosError.response?.data?.error || {}),
            },
            ...(axiosError.response?.data || {}),
          },
          status: axiosError.response?.status || 500,
          statusText:
            axiosError.response?.statusText || "Internal Server Error",
        };
        throw apiError;
      }
      throw error;
    }
  }

  public async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "POST", url, data });
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "PUT", url, data });
  }

  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "DELETE", url });
  }
}

export default ApiClient;
