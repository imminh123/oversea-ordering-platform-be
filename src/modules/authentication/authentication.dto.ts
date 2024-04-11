import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { OAuthClient } from './authentication.const';
import { Role } from '../../shared/constant';

export class CreateClientUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
    required: true,
  })
  password?: string;

  @IsOptional()
  @ApiProperty({
    type: String,
    example: 'abc@gmail.com',
    required: false,
  })
  mail: string;

  @IsOptional()
  @ApiProperty({
    type: String,
    example: '84567891234',
    required: false,
  })
  phone: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    example: '',
    required: false,
  })
  wareHouseAddress?: string;
}

export class CreateAdminUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
    required: true,
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'abc',
    required: false,
  })
  userName: string;
}

export class CreateSessionTokenDto extends PickType(CreateClientUserDto, [
  'mail',
  'password',
] as const) {}

export class ChangePasswordDto {
  @IsString()
  @ApiProperty({
    type: String,
    example: 'def',
    required: true,
  })
  password?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
    required: true,
  })
  newPassword: string;
}

export class UpdateAuthDto {
  @IsString()
  // @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  fullname: string;

  @IsString()
  // @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: '84',
    required: false,
  })
  phone: string;

  @IsString()
  // @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'dd/mm/yyyy',
  })
  birthday: string;

  @IsString()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  gender: string;

  @IsString()
  // @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  address: string;

  @IsString()
  // @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  province: string;

  @IsString()
  // @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  city: string;

  @IsString()
  // @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
    required: false,
  })
  ward: string;
}

export class UpdateOAuthDto {
  @IsEnum(OAuthClient)
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: OAuthClient.GOOGLE,
    enum: OAuthClient,
  })
  base: string;
}

export class UserIdDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: '64bd70033bffa3a83b0a9b57',
  })
  id: string;
}

export class DeleteUserIdDto {
  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    type: Array,
    example: ['64bd70033bffa3a83b0a9b57'],
  })
  ids: string[];
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: '',
  })
  token: string;
}

export class CreateSessionWithOAuth2Dto {
  @IsEnum(OAuthClient)
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: OAuthClient.GOOGLE,
    enum: OAuthClient,
  })
  base: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: '',
  })
  token: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: String,
    example: '',
  })
  redirect_uri: string;
}

export class AdminIndexAuthenDto {
  @ApiProperty({
    required: false,
    type: String,
    example: '',
  })
  search: string;

  @ApiProperty({
    required: false,
    type: String,
    example: '',
    enum: Role,
  })
  role: Role;

  @ApiProperty({
    required: false,
    type: Boolean,
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    required: false,
    type: Boolean,
    example: false,
  })
  isBlock: boolean;
}

export class AdminUpdateClientAuthenDto {
  @ApiProperty({
    required: false,
    type: Boolean,
    example: false,
  })
  isBlock: boolean;
}
