import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSku } from './entities/product-sku.entity';
import { CreateProductSkuDto } from './dto/create-product-sku.dto';
import { UpdateProductSkuDto } from './dto/update-product-sku.dto';

@Injectable()
export class ProductSkusService {
  constructor(
    @InjectRepository(ProductSku)
    private readonly productSkuRepository: Repository<ProductSku>,
  ) {}

  async create(
    createDto: CreateProductSkuDto,
    merchantId: number,
  ): Promise<ProductSku> {
    const sku = this.productSkuRepository.create({
      ...createDto,
      merchantId,
    });
    return await this.productSkuRepository.save(sku);
  }

  async findByProduct(
    productId: number,
    merchantId: number,
  ): Promise<ProductSku[]> {
    return await this.productSkuRepository.find({
      where: { productId, merchantId },
      relations: ['specValue1', 'specValue2', 'specValue3'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number, merchantId: number): Promise<ProductSku> {
    const sku = await this.productSkuRepository.findOne({
      where: { id, merchantId },
      relations: ['specValue1', 'specValue2', 'specValue3'],
    });

    if (!sku) {
      throw new NotFoundException('SKU不存在');
    }

    return sku;
  }

  async findBySkuCode(
    skuCode: string,
    merchantId: number,
  ): Promise<ProductSku> {
    return await this.productSkuRepository.findOne({
      where: { skuCode, merchantId },
      relations: ['specValue1', 'specValue2', 'specValue3'],
    });
  }

  async update(
    id: number,
    updateDto: UpdateProductSkuDto,
    merchantId: number,
  ): Promise<ProductSku> {
    const sku = await this.findOne(id, merchantId);
    Object.assign(sku, updateDto);
    return await this.productSkuRepository.save(sku);
  }

  async remove(id: number, merchantId: number): Promise<void> {
    const sku = await this.findOne(id, merchantId);
    await this.productSkuRepository.remove(sku);
  }

  async updateStock(
    id: number,
    quantity: number,
    merchantId: number,
  ): Promise<ProductSku> {
    const sku = await this.findOne(id, merchantId);
    sku.stock += quantity;
    if (sku.stock < 0) {
      sku.stock = 0;
    }
    return await this.productSkuRepository.save(sku);
  }
}
