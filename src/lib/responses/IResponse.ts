export interface IResponse<T = any> {
  hasError: boolean;
  message?: string;
  data?: T;
}
