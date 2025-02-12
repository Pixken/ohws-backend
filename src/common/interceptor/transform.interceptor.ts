import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';

export interface ResponseType<T> {
  data: T;
  code: number;
  message: string;
  success: boolean;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseType<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseType<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    // 处理 POST 请求默认返回 201 的问题
    if (request.method === 'POST' && response.statusCode === 201) {
      response.status(200);
    }

    return next.handle().pipe(
      map((data) => ({
        data,
        code: 200, // 默认成功状态码
        message: '操作成功', // 默认成功消息
        success: true,
      })),
    );
  }
}
