/**
 * 用户实体类
 * 在实际项目中，这通常会是一个数据库模型
 */
export class User {
  id: number;
  username: string;
  email: string;
  age?: number;
  createdAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
