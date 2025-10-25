import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * 日志拦截器 (Logging Interceptor)
 *
 * 学习要点:
 * - Interceptor 可以在方法执行前后添加额外逻辑
 * - 实现 NestInterceptor 接口
 * - 使用 RxJS 操作符处理响应
 * - tap 操作符可以观察值但不改变它
 *
 * 使用场景:
 * - 日志记录
 * - 性能监控
 * - 请求/响应转换
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    console.log(`📥 [Request] ${method} ${url} - ${new Date().toISOString()}`);

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - now;
        console.log(
          `📤 [Response] ${method} ${url} - ${responseTime}ms - ${new Date().toISOString()}`,
        );
      }),
    );
  }
}
