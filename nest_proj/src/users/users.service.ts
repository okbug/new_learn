import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Service (服务层)
 *
 * 学习要点:
 * - @Injectable() 装饰器标记这个类可以被注入
 * - 服务层负责业务逻辑处理
 * - 通过依赖注入系统在 Controller 中使用
 */
@Injectable()
export class UsersService {
  // 模拟数据库存储
  private users: User[] = [];
  private idCounter = 1;

  /**
   * 创建用户
   */
  create(createUserDto: CreateUserDto): User {
    const user = new User({
      id: this.idCounter++,
      ...createUserDto,
      createdAt: new Date(),
    });
    this.users.push(user);
    return user;
  }

  /**
   * 获取所有用户
   */
  findAll(): User[] {
    return this.users;
  }

  /**
   * 根据 ID 查找用户
   */
  findOne(id: number): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * 更新用户
   */
  update(id: number, updateUserDto: UpdateUserDto): User {
    const user = this.findOne(id);
    Object.assign(user, updateUserDto);
    return user;
  }

  /**
   * 删除用户
   */
  remove(id: number): void {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.users.splice(index, 1);
  }
}
