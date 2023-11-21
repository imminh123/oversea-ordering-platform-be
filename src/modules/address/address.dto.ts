import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import e from 'express';

export class CreateAddressDto {
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

export class ClientIndexAddressDto extends CreateAddressDto {
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  userId?: string;
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
}
