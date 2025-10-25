import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

/**
 * 数据转换管道示例
 *
 * 学习要点:
 * - 将字符串转换为大写
 * - 演示 Pipe 的数据转换功能
 */
@Injectable()
export class UpperCasePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return value.toUpperCase();
    }
    if (typeof value === 'object' && value.username) {
      value.username = value.username.toUpperCase();
    }
    return value;
  }
}
