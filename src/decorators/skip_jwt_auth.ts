import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';
export const SkipJwtAuth = () => SetMetadata(IS_PUBLIC, true);
