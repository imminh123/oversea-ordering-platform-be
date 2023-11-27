import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { AddressRepository } from './address.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { IAddressSchema } from './address.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DbModel.Address, schema: IAddressSchema },
    ]),
  ],
  controllers: [AddressController],
  providers: [AddressService, AddressRepository],
  exports: [AddressService],
})
export class AddressModule {}
