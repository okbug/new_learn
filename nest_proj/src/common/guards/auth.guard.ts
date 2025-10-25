import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * 认证守卫 (Authentication Guard)
 *
 * 学习要点:
 * - Guard 用于权限控制和认证
 * - 实现 CanActivate 接口
 * - canActivate 返回 true/false 决定是否允许访问
 * - 可以访问 Request 对象获取用户信息
 *
 * 使用场景:
 * - 用户认证
 * - 角色权限控制
 * - API 访问控制
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // 简单示例: 检查请求头中是否有 authorization
    // 实际项目中会验证 JWT token
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      console.log('❌ No authorization header found');
      return false;
    }

    // 模拟验证 token
    if (authHeader === 'Bearer valid-token') {
      console.log('✅ Valid token, access granted');
      // 可以在这里将用户信息附加到 request 对象
      request.user = { id: 1, username: 'admin' };
      return true;
    }

    console.log('❌ Invalid token');
    return false;
  }
}
