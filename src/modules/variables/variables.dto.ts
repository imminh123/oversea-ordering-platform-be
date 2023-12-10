import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddVariableDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
    required: true,
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: '',
    required: true,
  })
  value: string;

  @IsString()
  @ApiPropertyOptional({
    type: String,
    example: '',
    required: false,
  })
  description: string;
}

export class AdminIndexVariableDto {
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  name: string;
}

export class UpdateVariableDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: '',
    required: true,
  })
  value: string;

  @IsString()
  @ApiPropertyOptional({
    type: String,
    example: '',
    required: false,
  })
  description: string;
}
