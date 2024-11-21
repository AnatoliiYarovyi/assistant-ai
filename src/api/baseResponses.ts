export interface IOkResponse<T> {
  status: string;
  data: T;
}

export interface IErrorResponse {
  status: 'ERROR';
  code: number;
  message: string;
}

export const okResponse = <T>(data: T) => {
  return {
    status: 'OK',
    data,
  };
};

export const errorResponse = (code: number, message: string): IErrorResponse => ({
  status: 'ERROR',
  code,
  message,
});
