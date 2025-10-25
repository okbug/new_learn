/**
 * 更新用户 DTO
 * 使用 Partial 使所有字段可选
 */
export class UpdateUserDto {
  username?: string;
  email?: string;
  age?: number;
}
