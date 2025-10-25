import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { Roles } from './common/decorators/roles.decorator';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ValidationPipe } from './common/pipes/validation.pipe';

/**
 * 示例控制器 - 展示如何组合使用各种功能
 *
 * 学习要点:
 * - 如何组合使用多个装饰器
 * - 装饰器的执行顺序
 * - 实际应用场景
 */
@Controller('examples')
export class ExamplesController {
  /**
   * 示例 1: 基础路由
   * 无任何额外功能,最简单的路由
   */
  @Get('basic')
  getBasic() {
    return {
      message: '这是一个基础路由示例',
      timestamp: new Date(),
    };
  }

  /**
   * 示例 2: 使用拦截器
   * 响应会被 TransformInterceptor 包装
   */
  @Get('with-interceptor')
  @UseInterceptors(TransformInterceptor)
  getWithInterceptor() {
    return { message: '响应将被拦截器转换' };
  }

  /**
   * 示例 3: 使用认证守卫
   * 需要在请求头中携带 Authorization: Bearer valid-token
   */
  @Get('protected')
  @UseGuards(AuthGuard)
  getProtected() {
    return {
      message: '这是受保护的路由,需要认证',
      info: '请在请求头中添加: Authorization: Bearer valid-token',
    };
  }

  /**
   * 示例 4: 使用角色守卫
   * 需要特定角色才能访问
   * 注意: 这个示例需要先通过 AuthGuard,然后检查角色
   */
  @Get('admin-only')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  getAdminOnly() {
    return { message: '只有管理员可以访问这个路由' };
  }

  /**
   * 示例 5: 使用数据验证管道
   * 提交的数据会经过验证
   */
  @Post('validate')
  @UsePipes(ValidationPipe)
  createWithValidation(@Body() data: any) {
    return {
      message: '数据验证通过',
      receivedData: data,
    };
  }

  /**
   * 示例 6: 组合使用多个功能
   * 演示完整的请求处理流程
   *
   * 执行顺序:
   * 1. Middleware (全局配置的 LoggerMiddleware)
   * 2. Guards (AuthGuard)
   * 3. Interceptor (Before) - TransformInterceptor
   * 4. Pipes - ValidationPipe
   * 5. Controller Method
   * 6. Interceptor (After) - TransformInterceptor
   * 7. Exception Filters (如果有异常)
   */
  @Post('full-example')
  @UseGuards(AuthGuard)
  @UseInterceptors(TransformInterceptor)
  @UsePipes(ValidationPipe)
  createFullExample(@Body() data: any) {
    return {
      message: '完整示例 - 经过了所有层级的处理',
      data,
      processedAt: new Date(),
    };
  }

  /**
   * 示例 7: 触发异常
   * 演示异常过滤器的工作
   */
  @Get('error')
  throwError() {
    throw new Error('这是一个演示异常处理的示例');
  }
}
