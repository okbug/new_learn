# NestJS 核心概念速查表

## 请求处理流程

```
客户端请求
    ↓
Middleware (中间件)
    ↓
Guards (守卫)
    ↓
Interceptors (拦截器 - Before)
    ↓
Pipes (管道)
    ↓
Controller Method (控制器方法)
    ↓
Service (服务层)
    ↓
Response (响应)
    ↓
Interceptors (拦截器 - After)
    ↓
Exception Filters (如果有异常)
    ↓
客户端接收响应
```

## 装饰器速查

### 模块装饰器
```typescript
@Module({
  imports: [],      // 导入其他模块
  controllers: [],  // 该模块的控制器
  providers: [],    // 该模块的服务
  exports: []       // 导出供其他模块使用
})
```

### 控制器装饰器
```typescript
@Controller('path')              // 定义控制器路由前缀
@Get()                          // GET 请求
@Post()                         // POST 请求
@Put()                          // PUT 请求
@Patch()                        // PATCH 请求
@Delete()                       // DELETE 请求
@HttpCode(200)                  // 设置状态码
```

### 参数装饰器
```typescript
@Param('id')                    // 路由参数
@Body()                         // 请求体
@Query()                        // 查询参数
@Headers()                      // 请求头
@Req()                          // Request 对象
@Res()                          // Response 对象
```

### 功能装饰器
```typescript
@Injectable()                   // 标记类可被注入
@UseGuards(Guard)               // 使用守卫
@UseInterceptors(Interceptor)   // 使用拦截器
@UsePipes(Pipe)                 // 使用管道
@UseFilters(Filter)             // 使用过滤器
```

## 核心概念对比

| 概念 | 作用时机 | 主要用途 | 返回值影响 |
|------|---------|----------|-----------|
| **Middleware** | 路由处理前 | 请求预处理、日志 | 不影响,调用 next() |
| **Guards** | 路由处理前 | 认证、授权 | true/false 决定是否继续 |
| **Interceptors** | 处理前后 | 转换、缓存、日志 | 可以转换响应 |
| **Pipes** | 参数处理 | 验证、转换 | 转换后的值 |
| **Exception Filters** | 异常时 | 错误处理 | 错误响应格式 |

## 常用 CLI 命令

```bash
# 创建模块
nest g module users

# 创建控制器
nest g controller users

# 创建服务
nest g service users

# 创建完整的 CRUD 资源
nest g resource users

# 创建守卫
nest g guard common/guards/auth

# 创建拦截器
nest g interceptor common/interceptors/logging

# 创建管道
nest g pipe common/pipes/validation

# 创建过滤器
nest g filter common/filters/http-exception

# 创建中间件
nest g middleware common/middleware/logger
```

## 依赖注入

### 构造函数注入 (推荐)
```typescript
@Injectable()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
```

### 属性注入
```typescript
@Injectable()
export class UsersController {
  @Inject(UsersService)
  private usersService: UsersService;
}
```

## 作用域

```typescript
@Injectable({ scope: Scope.DEFAULT })   // 单例 (默认)
@Injectable({ scope: Scope.REQUEST })   // 每个请求一个实例
@Injectable({ scope: Scope.TRANSIENT }) // 每次注入都创建新实例
```

## 自定义装饰器示例

```typescript
// 创建装饰器
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// 使用装饰器
@Get()
findAll(@User() user: UserEntity) {
  return user;
}
```

## 异步提供者

```typescript
{
  provide: 'ASYNC_CONNECTION',
  useFactory: async () => {
    const connection = await createConnection();
    return connection;
  },
}
```

## 动态模块

```typescript
@Module({})
export class ConfigModule {
  static forRoot(options: ConfigOptions): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
      ],
      exports: ['CONFIG_OPTIONS'],
    };
  }
}
```

## 测试

### 单元测试
```typescript
describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### E2E 测试
```typescript
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
```

## 常见错误和解决方案

### 1. Circular Dependency (循环依赖)
```typescript
// 使用 forwardRef
@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}
}
```

### 2. Provider 未找到
- 确保 Provider 在模块的 providers 数组中
- 如果在其他模块使用,确保已导出 (exports)
- 检查模块是否已导入 (imports)

### 3. 装饰器顺序
装饰器从下往上执行:
```typescript
@UseInterceptors(LoggingInterceptor)  // 第二个执行
@UseGuards(AuthGuard)                 // 第一个执行
@Get()
findAll() {}
```

## 最佳实践

1. **模块化**: 按功能划分模块
2. **单一职责**: 每个类只做一件事
3. **依赖注入**: 使用 DI 而不是硬编码
4. **DTO**: 使用 DTO 定义接口数据结构
5. **异常处理**: 使用 HttpException 和自定义过滤器
6. **验证**: 使用 class-validator 验证输入
7. **配置**: 使用 @nestjs/config 管理配置
8. **测试**: 编写单元测试和 E2E 测试
9. **文档**: 使用 Swagger 生成 API 文档
10. **日志**: 使用 Logger 而不是 console.log
