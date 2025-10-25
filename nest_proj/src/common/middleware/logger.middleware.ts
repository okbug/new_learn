import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * 日志中间件
 *
 * 学习要点:
 * - Middleware 在路由处理之前执行
 * - 实现 NestMiddleware 接口
 * - 可以访问 Request 和 Response 对象
 * - 必须调用 next() 将控制权传递给下一个中间件
 *
 * 使用场景:
 * - 请求日志
 * - 请求预处理
 * - CORS 处理
 * - 身份验证
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    console.log(
      `🔵 [Middleware] ${method} ${originalUrl} - IP: ${ip} - ${userAgent}`,
    );

    // 监听响应结束事件
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      console.log(
        `🔵 [Middleware] ${method} ${originalUrl} - Status: ${statusCode} - ${duration}ms`,
      );
    });

    next();
  }
}
