import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  name?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  mail?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    example: 'Giao giờ hành chính',
    required: false,
  })
  note?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  address?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  province?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  city?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  ward?: string;

  @IsBoolean()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: Boolean,
    example: true,
    required: false,
  })
  isDefault?: boolean;
}

export class ClientIndexAddressDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  userId?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  name?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  phone?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  mail?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  note?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  address?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  province?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  city?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  ward?: string;

  @ApiProperty({
    type: Boolean,
    required: false,
  })
  isDefault?: boolean;
}

export class UpdateAddressDto extends CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  address?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  province?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  city?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  ward?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  name?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  mail?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  note?: string;
}
