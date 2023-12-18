import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    // "value" is an object containing the file's attributes and metadata
    if (value.size > tenMb) {
      throw new BadRequestException('Ảnh phải nhỏ hơn 10mb');
    }
    if (!value.mimetype || !['image/png', 'image/jpeg']) {
      throw new BadRequestException('Ảnh phải đúng định dạng png hoặc jpg');
    }

    return value;
  }
}
export const tenMb = 10000000;
