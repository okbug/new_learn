# NestJS 学习示例项目

这个项目包含了 NestJS 核心概念的学习示例,帮助你理解和掌握 NestJS 框架。

## 项目结构

```
src/
├── common/                     # 公共模块
│   ├── decorators/            # 自定义装饰器
│   │   └── roles.decorator.ts # 角色装饰器
│   ├── filters/               # 异常过滤器
│   │   ├── all-exceptions.filter.ts
│   │   └── http-exception.filter.ts
│   ├── guards/                # 守卫
│   │   ├── auth.guard.ts      # 认证守卫
│   │   └── roles.guard.ts     # 角色守卫
│   ├── interceptors/          # 拦截器
│   │   ├── logging.interceptor.ts
│   │   ├── timeout.interceptor.ts
│   │   └── transform.interceptor.ts
│   ├── middleware/            # 中间件
│   │   ├── cors.middleware.ts
│   │   └── logger.middleware.ts
│   └── pipes/                 # 管道
│       ├── uppercase.pipe.ts
│       └── validation.pipe.ts
├── users/                     # 用户模块 (示例 CRUD)
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── user.entity.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

## 核心概念示例

### 1. Module (模块)
- **位置**: `src/users/users.module.ts`
- **说明**: 演示如何组织相关的控制器和服务
- **学习要点**:
  - @Module() 装饰器
  - imports, controllers, providers, exports

### 2. Controller (控制器)
- **位置**: `src/users/users.controller.ts`
- **说明**: RESTful API 路由处理
- **学习要点**:
  - HTTP 方法装饰器 (@Get, @Post, @Patch, @Delete)
  - 路由参数 (@Param)
  - 请求体 (@Body)
  - 依赖注入

### 3. Provider/Service (服务)
- **位置**: `src/users/users.service.ts`
- **说明**: 业务逻辑处理
- **学习要点**:
  - @Injectable() 装饰器
  - 依赖注入机制
  - 业务逻辑封装

### 4. DTO (数据传输对象)
- **位置**: `src/users/dto/`
- **说明**: 定义数据结构和验证规则
- **学习要点**:
  - 类型安全
  - 数据验证基础

### 5. Pipes (管道)
- **位置**: `src/common/pipes/`
- **说明**: 数据转换和验证
- **示例**:
  - `validation.pipe.ts` - 数据验证
  - `uppercase.pipe.ts` - 数据转换

### 6. Guards (守卫)
- **位置**: `src/common/guards/`
- **说明**: 权限控制和认证
- **示例**:
  - `auth.guard.ts` - 认证守卫
  - `roles.guard.ts` - 基于角色的访问控制

### 7. Interceptors (拦截器)
- **位置**: `src/common/interceptors/`
- **说明**: 请求/响应处理
- **示例**:
  - `logging.interceptor.ts` - 日志记录
  - `transform.interceptor.ts` - 响应转换
  - `timeout.interceptor.ts` - 超时处理

### 8. Exception Filters (异常过滤器)
- **位置**: `src/common/filters/`
- **说明**: 统一异常处理
- **示例**:
  - `http-exception.filter.ts` - HTTP 异常处理
  - `all-exceptions.filter.ts` - 全局异常处理

### 9. Middleware (中间件)
- **位置**: `src/common/middleware/`
- **说明**: 请求预处理
- **示例**:
  - `logger.middleware.ts` - 请求日志
  - `cors.middleware.ts` - CORS 处理

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run start:dev
```

### 3. 测试 API

#### 创建用户
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "email": "john@example.com", "age": 25}'
```

#### 获取所有用户
```bash
curl http://localhost:3000/users
```

#### 获取单个用户
```bash
curl http://localhost:3000/users/1
```

#### 更新用户
```bash
curl -X PATCH http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"age": 26}'
```

#### 删除用户
```bash
curl -X DELETE http://localhost:3000/users/1
```

## 学习路径建议

### 第一周: 基础概念
1. 阅读并理解 `users` 模块的完整实现
2. 修改 Controller 添加新的路由
3. 在 Service 中添加新的业务逻辑
4. 创建新的 DTO

### 第二周: 中间层
1. 研究 Pipes 的使用,尝试创建自定义验证规则
2. 理解 Guards 的工作原理,实现自己的认证逻辑
3. 使用 Interceptors 添加缓存功能
4. 自定义异常过滤器处理特定错误

### 第三周: 高级特性
1. 集成数据库 (TypeORM 或 Prisma)
2. 实现 JWT 认证
3. 添加配置管理 (@nestjs/config)
4. 编写单元测试和 E2E 测试

## 测试守卫功能

### 测试认证守卫
要使用需要认证的端点,需要在请求头中添加 Authorization:

```bash
# 无 token - 将被拒绝
curl http://localhost:3000/users

# 有效 token - 允许访问
curl -H "Authorization: Bearer valid-token" http://localhost:3000/users
```

### 应用守卫到路由
在 `users.controller.ts` 中添加:

```typescript
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('users')
@UseGuards(AuthGuard)  // 应用到整个控制器
export class UsersController {
  // ...
}
```

## 使用拦截器

### 应用响应转换拦截器
在控制器或方法上使用:

```typescript
import { UseInterceptors } from '@nestjs/common';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor';

@UseInterceptors(TransformInterceptor)
@Get()
findAll() {
  return this.usersService.findAll();
}
```

响应将被转换为:
```json
{
  "data": [...],
  "statusCode": 200,
  "message": "Success",
  "timestamp": "2025-10-25T..."
}
```

## 常见问题

### 1. 如何应用 Pipe?
```typescript
// 方法级别
@Post()
create(@Body(ValidationPipe) createUserDto: CreateUserDto) {}

// 参数级别
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {}
```

### 2. 如何应用 Guard?
```typescript
// 方法级别
@UseGuards(AuthGuard)
@Get()
findAll() {}

// 控制器级别
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {}

// 全局级别 (在 main.ts)
app.useGlobalGuards(new AuthGuard());
```

### 3. 如何应用拦截器?
```typescript
// 方法级别
@UseInterceptors(LoggingInterceptor)
@Get()
findAll() {}

// 全局级别 (已在 AppModule 中配置)
```

## 进阶学习资源

- [NestJS 官方文档](https://docs.nestjs.com)
- [NestJS 中文文档](https://docs.nestjs.cn)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)

## 下一步

1. 集成真实数据库 (PostgreSQL + TypeORM / Prisma)
2. 实现 JWT 认证系统
3. 添加 Swagger API 文档
4. 实现文件上传功能
5. 添加 WebSocket 支持
6. 编写完整的测试用例
