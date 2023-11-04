import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumberString, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { maxNumberOfRecordPerPage } from './pagination.helper';

export class PaginationDto {
  @IsOptional()
  @IsNumberString()
  @ApiPropertyOptional({
    type: 'integer',
    description: 'Page number',
  })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(maxNumberOfRecordPerPage)
  @ApiPropertyOptional({
    type: 'integer',
    description: 'Display a limit per page',
  })
  perPage?: number;
}
