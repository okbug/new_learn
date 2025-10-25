import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * HTTP 异常过滤器
 *
 * 学习要点:
 * - ExceptionFilter 用于统一异常处理
 * - @Catch() 装饰器指定要捕获的异常类型
 * - 可以自定义错误响应格式
 * - 实现 ExceptionFilter 接口
 *
 * 使用场景:
 * - 统一错误响应格式
 * - 错误日志记录
 * - 敏感信息过滤
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // 构建统一的错误响应格式
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || 'Internal server error',
    };

    // 记录错误日志
    console.error(
      `🚨 [Exception] ${request.method} ${request.url} - Status: ${status}`,
      errorResponse,
    );

    response.status(status).json(errorResponse);
  }
}
