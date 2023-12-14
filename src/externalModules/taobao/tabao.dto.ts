import { ApiProperty } from '@nestjs/swagger';
import { LanguageOptionV3, SortOptionV2, SortOptionV3 } from './taobao.enum';

export class SearchItemDto {
  @ApiProperty({
    type: String,
    example: '',
    required: false,
  })
  text: string;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  page: number;
}

export class SearchItemDtoV2 {
  @ApiProperty({
    type: String,
    example: '',
    required: true,
  })
  q: string;

  @ApiProperty({
    type: String,
    example: '1',
    required: true,
  })
  page: string;

  @ApiProperty({
    type: String,
    example: SortOptionV2.default,
    required: false,
    enum: SortOptionV2,
  })
  sort: SortOptionV2;
}

export class SearchItemDtoV3 {
  @ApiProperty({
    type: String,
    example: '',
    required: true,
  })
  q: string;

  @ApiProperty({
    type: String,
    example: 1,
    required: false,
  })
  page: string;

  @ApiProperty({
    type: String,
    example: SortOptionV3.default,
    required: false,
    enum: SortOptionV3,
  })
  sort: SortOptionV3;

  @ApiProperty({
    type: String,
    example: LanguageOptionV3.China,
    required: false,
    enum: LanguageOptionV3,
  })
  target_language: LanguageOptionV3;

  @ApiProperty({
    type: String,
    example: LanguageOptionV3.China,
    required: false,
    enum: LanguageOptionV3,
  })
  query_language: LanguageOptionV3;

  @ApiProperty({
    type: Number,
    example: 0,
    required: false,
  })
  minPrice: number;

  @ApiProperty({
    type: Number,
    example: 100,
    required: false,
  })
  maxPrice: number;

  @ApiProperty({
    type: Boolean,
    example: false,
    required: false,
  })
  inStock: boolean;

  @ApiProperty({
    type: Boolean,
    example: false,
    required: false,
  })
  isTmall: boolean;

  @ApiProperty({
    type: Boolean,
    example: false,
    required: false,
  })
  hasDiscount: boolean;
}

export class SearchByImage {
  @ApiProperty({
    type: String,
    example: 1,
    required: false,
  })
  page: string;

  @ApiProperty({
    type: String,
    example: SortOptionV3.default,
    required: false,
    enum: SortOptionV3,
  })
  sort: SortOptionV3;

  @ApiProperty({
    type: String,
    example: LanguageOptionV3.China,
    required: false,
    enum: LanguageOptionV3,
  })
  target_language: LanguageOptionV3;

  @ApiProperty({
    type: String,
    example: LanguageOptionV3.China,
    required: false,
    enum: LanguageOptionV3,
  })
  query_language: LanguageOptionV3;

  @ApiProperty({
    type: Number,
    example: 0,
    required: false,
  })
  minPrice: number;

  @ApiProperty({
    type: Number,
    example: 100,
    required: false,
  })
  maxPrice: number;

  @ApiProperty({
    type: Boolean,
    example: false,
    required: false,
  })
  inStock: boolean;

  @ApiProperty({
    type: Boolean,
    example: false,
    required: false,
  })
  isTmall: boolean;

  @ApiProperty({
    type: Boolean,
    example: false,
    required: false,
  })
  hasDiscount: boolean;
}

export class UploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;
}
