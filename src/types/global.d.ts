export {}

declare global {
  interface IBackendResponse<T> {
    success: boolean;
    message: string;
    data: T;
    statusCode?: number;
  }

  interface IResponseList<T>{
    result: T[]
    meta: IMeta
  }

  interface IMeta {
    current: number;
    pageSize: number;
    pages: number;
    total: number;
  }
}
