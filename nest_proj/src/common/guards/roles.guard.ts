import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * 角色守卫 (Roles Guard)
 *
 * 学习要点:
 * - 结合装饰器和 Reflector 使用
 * - 实现基于角色的访问控制 (RBAC)
 * - 通过元数据判断用户角色
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 从方法或类上获取 roles 元数据
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      // 如果没有设置角色要求，允许访问
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      console.log('❌ No user found in request');
      return false;
    }

    // 检查用户是否有所需角色
    const hasRole = roles.some((role) => user.roles?.includes(role));

    if (hasRole) {
      console.log(`✅ User has required role: ${roles.join(', ')}`);
      return true;
    }

    console.log(`❌ User lacks required role: ${roles.join(', ')}`);
    return false;
  }
}
