import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { ApiResponse, ApiError } from "@/types/api";
import Cookies from "js-cookie";
import { useUserStore } from "@/stores/userStore";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5010/api";

class ApiClient {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Important for cookies
    });

    // Add request interceptor for auth token
    this.axios.interceptors.request.use(
      (config) => {
        const token = useUserStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token refresh if needed
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // You can implement token refresh logic here if needed
            // const newToken = await refreshToken();
            // Cookies.set('token', newToken, { path: '/' });
            // originalRequest.headers.Authorization = `Bearer ${newToken}`;
            // return this.axios(originalRequest);
          } catch (error) {
            // If refresh fails, clear the token and redirect to login
            console.log(`apiClient error: ${error}`);
            Cookies.remove("token", { path: "/" });
            window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async request<T>(
    config: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.axios({
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

export const apiClient = new ApiClient();
