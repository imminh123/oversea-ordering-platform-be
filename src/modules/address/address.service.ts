import { Injectable } from '@nestjs/common';
import { BaseService } from '../../shared/baseService';
import { IAddress, IAddressDocument } from './address.interface';
import { AddressRepository } from './address.repository';
import { CreateAddressDto, UpdateAddressDto } from './address.dto';

@Injectable()
export class AddressService extends BaseService<IAddressDocument, IAddress> {
  constructor(private readonly addressRepository: AddressRepository) {
    super(addressRepository);
  }

  async createAddress(createAddressDto: CreateAddressDto, userId: string) {
    const addressDefault = await this.addressRepository.findOne({
      isDefault: true,
      userId,
    });
    if (!addressDefault) {
      createAddressDto.isDefault = true;
    } else if (createAddressDto.isDefault) {
      await this.addressRepository.updateById(addressDefault.id, {
        isDefault: false,
      });
    }

    return this.createDocument(createAddressDto, userId);
  }

  async updateAddressById(id: string, updateAddressDto: UpdateAddressDto) {
    const address = await this.getDocumentById(id);
    if (updateAddressDto.isDefault) {
      await this.addressRepository.findOneAndUpdate(
        {
          userId: address.userId,
          isDefault: true,
        },
        { isDefault: false },
      );
    }
    return this.updateDocumentById(id, updateAddressDto);
  }
}
