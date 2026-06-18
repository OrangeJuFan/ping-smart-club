import { appConfig } from '@/config/app';

export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code = 500,
  ) {
    super(message);
  }
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
    throw new ApiError('请求处理失败，请稍后重试');
  }
}

export function clone<T>(value: T): T {
  return structuredClone(value);
}

export function assertFound<T>(value: T | undefined, message = '数据不存在'): T {
  if (!value) throw new ApiError(message, 404);
  return value;
}
