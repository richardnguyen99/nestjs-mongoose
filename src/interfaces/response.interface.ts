export interface OkResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  requestCtx: {
    method: string;
    url: string;
    query: Record<string, any>;
    params: Record<string, any>;
  };
}
