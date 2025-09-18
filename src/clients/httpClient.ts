// httpClient.ts
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import * as TE from "fp-ts/TaskEither";
import { TaskEither } from "fp-ts/TaskEither";

interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  success: boolean;
  message?: string;
}

// --- Error type ---
export interface HttpError {
  status?: number;
  message: string;
  original?: unknown;
}

// --- Snake/Camel key mappers ---
function toCamelCase<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => toCamelCase(item)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      result[camelKey] = toCamelCase(val);
    }
    return result as T;
  }
  return value;
}

function toSnakeCase<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => toSnakeCase(item)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      result[snakeKey] = toSnakeCase(val);
    }
    return result as T;
  }
  return value;
}

// --- Token storage & refresh helpers ---
const TOKEN_KEY = "jwt_token";
const TOKEN_TS_KEY = "jwt_token_ts";

function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_TS_KEY, new Date().toISOString());
}

function readToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function tokenAgeMinutes(): number {
  const ts = localStorage.getItem(TOKEN_TS_KEY);
  if (!ts) return Infinity;
  return (Date.now() - new Date(ts).getTime()) / 60000;
}

// (Login response handled in interceptor; no static interface needed)

// --- HttpClient with auto‐refresh + TaskEither ---
export class HttpClient {
  private readonly client: AxiosInstance; // with interceptors
  private readonly rawClient: AxiosInstance; // no interceptors
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseURL: string) {
    this.client = axios.create({ baseURL });
    this.rawClient = axios.create({ baseURL });

    // Response interceptor to persist token on login and handle 401 refresh
    this.client.interceptors.response.use(
      (resp) => {
        const url = resp.config.url ?? "";
        if (url.endsWith("/api/login")) {
          // Handle different response structures
          let token: string | undefined;

          if (resp.data) {
            // Check for direct accessToken property
            if (resp.data.accessToken) {
              token = resp.data.accessToken;
            }
            // Check for legacy token property
            else if (resp.data.token) {
              token = resp.data.token;
            }
            // Check for wrapped structure
            else if (resp.data.data && resp.data.data.accessToken) {
              token = resp.data.data.accessToken;
            } else if (resp.data.data && resp.data.data.token) {
              token = resp.data.data.token;
            }
          }

          if (token) {
            storeToken(token);
            console.log("Token stored successfully");
          } else {
            console.warn("No token found in login response:", resp.data);
          }
        }
        return resp;
      },
      async (error: AxiosError) => {
        const status = error.response?.status;
        const originalConfig = error.config as
          | (InternalAxiosRequestConfig & {
              _retry?: boolean;
            })
          | undefined;

        if (status === 401 && originalConfig && !originalConfig._retry) {
          originalConfig._retry = true;
          const current = readToken();
          const refreshed = await this.refreshToken(current);
          if (refreshed) {
            originalConfig.headers = {
              ...(originalConfig.headers as AxiosRequestHeaders),
              Authorization: `Bearer ${refreshed}`,
            } as AxiosRequestHeaders;
            return this.client.request(originalConfig);
          } else {
            // Clear tokens on hard failure
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(TOKEN_TS_KEY);
          }
        }
        return Promise.reject(error);
      }
    );

    // Request interceptor to refresh & attach Bearer
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const url = config.url ?? "";
        // 1) skip interceptor for refresh endpoint itself
        if (url.endsWith("/api/refresh")) {
          return config;
        }

        // 2) ensure headers object
        config.headers = (config.headers ?? {}) as AxiosRequestHeaders;

        // 3) check token age
        const token = readToken();
        const age = tokenAgeMinutes();

        if (!token) {
          // No token, proceed without auth
          return config;
        }

        // Attach current token by default
        config.headers.Authorization = `Bearer ${token}`;

        // Proactive refresh near expiry (time-based heuristic)
        if (age > 29) {
          const refreshed = await this.refreshToken(token);
          if (refreshed) {
            config.headers.Authorization = `Bearer ${refreshed}`;
          }
        }

        return config;
      },
      (err) => Promise.reject(err)
    );
  }

  /** Single-flight token refresh using Authorization: Bearer {oldToken} */
  private async refreshToken(oldToken: string | null): Promise<string | null> {
    if (!oldToken) return null;
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = this.rawClient
      .post<{
        access_token: string;
        token_type: string;
        expires_in: number;
      }>(
        "/api/refresh",
        {},
        {
          headers: {
            Authorization: `Bearer ${oldToken}`,
          },
        }
      )
      .then((res) => {
        const newToken = res.data?.access_token;
        if (newToken) {
          storeToken(newToken);
          return newToken;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  /** Optional manual seeding of the token on login */
  public saveLogin(token: string): void {
    storeToken(token);
  }

  /** Wrap an async action in a TaskEither */
  private wrapRequest<T>(action: () => Promise<T>): TaskEither<HttpError, T> {
    return TE.tryCatch(action, (reason: unknown) =>
      (reason as AxiosError).isAxiosError
        ? {
            status: (reason as AxiosError).response?.status,
            message:
              ((reason as AxiosError).response?.data as { message?: string })
                ?.message || (reason as AxiosError).message,
            original: reason,
          }
        : { message: String(reason), original: reason }
    );
  }

  get<T>(
    url: string,
    params?: Record<string, unknown>
  ): TaskEither<HttpError, T> {
    return this.wrapRequest(async () => {
      const snakeParams = params ? toSnakeCase(params) : undefined;
      const resp = await this.client.get<HttpResponse<T>>(url, {
        params: snakeParams,
      });
      return toCamelCase(resp.data.data) as T;
    });
  }

  post<T, B = Record<string, unknown>>(
    url: string,
    body: B
  ): TaskEither<HttpError, T> {
    return this.wrapRequest(async () => {
      // If body is FormData, send as-is (multipart) without snake-casing
      if (typeof FormData !== "undefined" && body instanceof FormData) {
        // Let Axios set the multipart boundary automatically when FormData is provided
        const resp = await this.client.post<T | HttpResponse<T>>(url, body);

        if (resp.data && typeof resp.data === "object" && "data" in resp.data) {
          return toCamelCase((resp.data as HttpResponse<T>).data) as T;
        }
        return toCamelCase(resp.data) as T;
      }

      // Default JSON path with snake-cased keys
      const snakeBody = toSnakeCase(body);
      const resp = await this.client.post<T | HttpResponse<T>>(url, snakeBody);

      if (resp.data && typeof resp.data === "object" && "data" in resp.data) {
        return toCamelCase((resp.data as HttpResponse<T>).data) as T;
      }
      return toCamelCase(resp.data) as T;
    });
  }

  put<T, B = Record<string, unknown>>(
    url: string,
    body: B
  ): TaskEither<HttpError, T> {
    return this.wrapRequest(async () => {
      const snakeBody = toSnakeCase(body);
      const resp = await this.client.put<HttpResponse<T>>(url, snakeBody);
      return toCamelCase(resp.data.data) as T;
    });
  }

  delete<T = void>(url: string): TaskEither<HttpError, T> {
    return this.wrapRequest(async () => {
      const resp = await this.client.delete<HttpResponse<T>>(url);
      return toCamelCase(resp.data.data) as T;
    });
  }
}
