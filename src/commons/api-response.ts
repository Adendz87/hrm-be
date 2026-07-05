import { HttpStatus } from '@nestjs/common';
import { Paginated } from 'nestjs-paginate';


export class PaginatedResponse<T> {
  data!: T[];
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class ApiResponse {
  statusCode: number;
  message: string;
  data: any;
  meta: any;
  links: any;

  constructor(
    statusCode: number,
    message: string,
    data: any = null,
    meta: any = undefined,
    link: any = undefined,
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = meta;
    this.links = link;
  }

  static success(message: string, data: any = null) {
    return new ApiResponse(HttpStatus.OK, message, data);
  }

  //   NOTE: Work with nestjs-paginate
  static successWithPagination(message: string, responseData: Paginated<any>) {
    const { data, meta, links } = responseData;
    return new ApiResponse(HttpStatus.OK, message, data, meta, links);
  }

  static successWithList(message:string, data:any = null) {
	return new ApiResponse(HttpStatus.OK, message, data);
  }
  // NOTE: Work with nestjs-paginate li
  static error(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    data: any = null,
  ) {
    return new ApiResponse(statusCode, message, data);
  }
}
