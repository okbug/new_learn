import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

/**
 * 自定义验证管道 (Custom Validation Pipe)
 *
 * 学习要点:
 * - Pipe 用于数据转换和验证
 * - 实现 PipeTransform 接口
 * - transform 方法接收 value 和 metadata
 * - 可以抛出异常来中断请求
 *
 * 使用场景:
 * - 数据类型转换
 * - 数据验证
 * - 数据清洗
 */
@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // 示例: 验证字符串长度
    if (metadata.type === 'body' && typeof value === 'object') {
      if (value.username && value.username.length < 3) {
        throw new BadRequestException('Username must be at least 3 characters');
      }
      if (value.email && !this.isValidEmail(value.email)) {
        throw new BadRequestException('Invalid email format');
      }
    }
    return value;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
