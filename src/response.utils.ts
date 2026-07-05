import { HttpException } from '@nestjs/common';

interface ResponseObject {
  message: string;
  data?: any;
  code?: number;
}

export type ResultObject = {
  error: boolean;
  type?: string;
};

export const ServiceError = (type = 'DEFAULT'): ResultObject => {
  return { error: true, type };
};

export const ServiceSuccess = (): ResultObject => {
  return { error: false };
};

export const SendResponse = (response_object: ResponseObject) => {
  const { message } = response_object;
  let { data, code } = response_object;

  if (!data) data = {};
  if (!code) code = 200;

  if (code === 200) {
    return {
      error: 0,
      statusCode: 200,
      message: [message],
      data,
    };
  } else {
    throw new HttpException(
      {
        error: 1,
        statusCode: code,
        message: [message],
        data,
      },
      code,
    );
  }
};
