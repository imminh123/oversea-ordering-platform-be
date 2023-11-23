import { ApiProperty } from '@nestjs/swagger';

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
