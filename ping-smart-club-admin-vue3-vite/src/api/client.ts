import { appConfig } from '@/config/app';
import type { ApiErrorCode, ApiResult } from '@/types/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: ApiErrorCode = 500,
  ) {
    super(message);
  }
}

export const apiRuntime = {
  useMock: import.meta.env.VITE_USE_MOCK !== 'false',
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
};

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof Error) return new ApiError(error.message || '请求处理失败，请稍后重试');
  return new ApiError('请求处理失败，请稍后重试');
}

export async function mockRequest<T>(dataFactory: () => T, message = 'ok'): Promise<ApiResult<T>> {
  await new Promise((resolve) => window.setTimeout(resolve, appConfig.mockLatencyMs));

  try {
    return {
      code: 0,
      message,
      data: dataFactory(),
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw normalizeApiError(error);
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const response = await window.fetch(`${apiRuntime.baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (response.status === 401) throw new ApiError('登录状态已失效，请重新登录', 401);
  if (response.status === 403) throw new ApiError('当前账号没有访问权限', 403);
  if (!response.ok) throw new ApiError(`请求失败：${response.status}`, 500);

  return response.json() as Promise<ApiResult<T>>;
}

export function clone<T>(value: T): T {
  return structuredClone(value);
}

export function assertFound<T>(value: T | undefined, message = '数据不存在'): T {
  if (!value) throw new ApiError(message, 404);
  return value;
}
