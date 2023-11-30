import { ApiProperty } from '@nestjs/swagger';
import { SortOptionV2 } from './taobao.enum';

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
