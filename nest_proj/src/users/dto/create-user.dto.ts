/**
 * DTO (Data Transfer Object) - 数据传输对象
 * 用于定义接口接收的数据结构
 *
 * 学习要点:
 * - DTO 用于数据验证和类型安全
 * - 可以配合 class-validator 进行数据验证
 */
export class CreateUserDto {
  username: string;
  email: string;
  age?: number;
}
