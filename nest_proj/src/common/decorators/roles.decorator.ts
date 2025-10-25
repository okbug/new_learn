import { SetMetadata } from '@nestjs/common';

/**
 * 角色装饰器
 *
 * 学习要点:
 * - 自定义装饰器
 * - 使用 SetMetadata 设置元数据
 * - 配合 Guard 使用
 *
 * 使用示例:
 * @Roles('admin', 'user')
 * @Get()
 * findAll() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
