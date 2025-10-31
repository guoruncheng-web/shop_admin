import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkuSpecName } from './entities/sku-spec-name.entity';
import { CreateSkuSpecNameDto } from './dto/create-sku-spec-name.dto';
import { UpdateSkuSpecNameDto } from './dto/update-sku-spec-name.dto';

@Injectable()
export class SkuSpecNamesService {
  constructor(
    @InjectRepository(SkuSpecName)
    private readonly skuSpecNameRepository: Repository<SkuSpecName>,
  ) {}

  async create(
    createDto: CreateSkuSpecNameDto,
    merchantId: number,
  ): Promise<SkuSpecName> {
    const specName = this.skuSpecNameRepository.create({
      ...createDto,
      merchantId,
    });
    return await this.skuSpecNameRepository.save(specName);
  }

  async findByProduct(productId: number, merchantId: number): Promise<SkuSpecName[]> {
    return await this.skuSpecNameRepository.find({
      where: { productId, merchantId },
      relations: ['specValues'],
      order: { specLevel: 'ASC', sort: 'ASC' },
    });
  }

  async findOne(id: number, merchantId: number): Promise<SkuSpecName> {
    const specName = await this.skuSpecNameRepository.findOne({
      where: { id, merchantId },
      relations: ['specValues'],
    });

    if (!specName) {
      throw new NotFoundException('规格名称不存在');
    }

    return specName;
  }

  async update(
    id: number,
    updateDto: UpdateSkuSpecNameDto,
    merchantId: number,
  ): Promise<SkuSpecName> {
    const specName = await this.findOne(id, merchantId);
    Object.assign(specName, updateDto);
    return await this.skuSpecNameRepository.save(specName);
  }

  async remove(id: number, merchantId: number): Promise<void> {
    const specName = await this.findOne(id, merchantId);
    await this.skuSpecNameRepository.remove(specName);
  }
}
