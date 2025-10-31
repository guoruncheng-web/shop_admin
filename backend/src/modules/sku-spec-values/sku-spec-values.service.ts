import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkuSpecValue } from './entities/sku-spec-value.entity';
import { CreateSkuSpecValueDto } from './dto/create-sku-spec-value.dto';
import { UpdateSkuSpecValueDto } from './dto/update-sku-spec-value.dto';

@Injectable()
export class SkuSpecValuesService {
  constructor(
    @InjectRepository(SkuSpecValue)
    private readonly skuSpecValueRepository: Repository<SkuSpecValue>,
  ) {}

  async create(
    createDto: CreateSkuSpecValueDto,
    merchantId: number,
  ): Promise<SkuSpecValue> {
    const specValue = this.skuSpecValueRepository.create({
      ...createDto,
      merchantId,
    });
    return await this.skuSpecValueRepository.save(specValue);
  }

  async findBySpecName(
    specNameId: number,
    merchantId: number,
  ): Promise<SkuSpecValue[]> {
    return await this.skuSpecValueRepository.find({
      where: { specNameId, merchantId },
      order: { sort: 'ASC' },
    });
  }

  async findOne(id: number, merchantId: number): Promise<SkuSpecValue> {
    const specValue = await this.skuSpecValueRepository.findOne({
      where: { id, merchantId },
    });

    if (!specValue) {
      throw new NotFoundException('规格值不存在');
    }

    return specValue;
  }

  async update(
    id: number,
    updateDto: UpdateSkuSpecValueDto,
    merchantId: number,
  ): Promise<SkuSpecValue> {
    const specValue = await this.findOne(id, merchantId);
    Object.assign(specValue, updateDto);
    return await this.skuSpecValueRepository.save(specValue);
  }

  async remove(id: number, merchantId: number): Promise<void> {
    const specValue = await this.findOne(id, merchantId);
    await this.skuSpecValueRepository.remove(specValue);
  }
}
