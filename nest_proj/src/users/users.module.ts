import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

/**
 * Module (模块)
 *
 * 学习要点:
 * - @Module() 装饰器定义模块
 * - controllers: 该模块的控制器
 * - providers: 该模块的服务提供者
 * - exports: 导出供其他模块使用的 providers
 * - imports: 导入其他模块
 */
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // 导出 service 供其他模块使用
})
export class UsersModule {}
