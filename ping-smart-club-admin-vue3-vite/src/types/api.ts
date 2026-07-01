export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageQuery {
  page: number;
  pageSize: number;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type ApiErrorCode = 400 | 401 | 403 | 404 | 409 | 500;
