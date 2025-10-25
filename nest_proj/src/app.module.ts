import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ExamplesController } from './examples.controller';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

/**
 * 根模块 (Root Module)
 *
 * 学习要点:
 * - 使用 imports 导入其他功能模块
 * - 使用 APP_FILTER 提供全局异常过滤器
 * - 使用 APP_INTERCEPTOR 提供全局拦截器
 * - 实现 NestModule 接口来配置中间件
 */
@Module({
  imports: [UsersModule], // 导入用户模块
  controllers: [AppController, ExamplesController], // 添加示例控制器
  providers: [
    AppService,
    // 全局拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // 全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  /**
   * 配置中间件
   * 可以指定中间件应用到哪些路由
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*'); // 应用到所有路由
  }
}
