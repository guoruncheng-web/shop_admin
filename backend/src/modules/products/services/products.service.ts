import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../../categories/entities/category.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { QueryProductDto } from '../dto/query-product.dto';

interface RequestUser {
  userId: number;
  merchantId: number;
  isSuperMerchant?: boolean;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}

  /**
   * 创建商品
   */
  async create(
    createProductDto: CreateProductDto,
    user: RequestUser,
  ): Promise<Product> {
    // 验证分类
    await this.validateCategory(createProductDto.categoryId, user.merchantId);

    // 验证品牌
    if (createProductDto.brandId) {
      await this.validateBrand(createProductDto.brandId, user.merchantId);
    }

    // 生成商品编号
    const productNo = await this.generateProductNo();

    // 创建商品基本信息
    const product = this.productRepository.create({
      ...createProductDto,
      productNo,
      merchantId: user.merchantId,
      createdBy: user.userId,
      updatedBy: user.userId,
    });

    return await this.productRepository.save(product);
  }

  /**
   * 分页查询商品列表
   */
  async findAll(
    queryDto: QueryProductDto,
    user: RequestUser,
  ): Promise<{
    list: Product[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const { page = 1, limit = 10, ...filters } = queryDto;
    const pageSize = limit;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.merchant', 'merchant')
      .where('product.deletedAt IS NULL');

    // 商户过滤
    if (!user.isSuperMerchant) {
      queryBuilder.andWhere('product.merchantId = :merchantId', {
        merchantId: user.merchantId,
      });
    } else if (filters.merchantId) {
      queryBuilder.andWhere('product.merchantId = :merchantId', {
        merchantId: filters.merchantId,
      });
    }

    // 其他过滤条件
    if (filters.productName) {
      queryBuilder.andWhere('product.productName LIKE :productName', {
        productName: `%${filters.productName}%`,
      });
    }

    if (filters.productNo) {
      queryBuilder.andWhere('product.productNo = :productNo', {
        productNo: filters.productNo,
      });
    }

    if (filters.categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters.brandId) {
      queryBuilder.andWhere('product.brandId = :brandId', {
        brandId: filters.brandId,
      });
    }

    if (filters.status !== undefined) {
      queryBuilder.andWhere('product.status = :status', {
        status: filters.status,
      });
    }

    if (filters.isHot !== undefined) {
      queryBuilder.andWhere('product.isHot = :isHot', { isHot: filters.isHot });
    }

    if (filters.isNew !== undefined) {
      queryBuilder.andWhere('product.isNew = :isNew', { isNew: filters.isNew });
    }

    if (filters.isRecommend !== undefined) {
      queryBuilder.andWhere('product.isRecommend = :isRecommend', {
        isRecommend: filters.isRecommend,
      });
    }

    if (filters.isDiscount !== undefined) {
      queryBuilder.andWhere('product.isDiscount = :isDiscount', {
        isDiscount: filters.isDiscount,
      });
    }

    // 排序
    queryBuilder.orderBy('product.sort', 'ASC');
    queryBuilder.addOrderBy('product.id', 'DESC');

    // 分页
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 查询商品详情
   */
  async findOne(id: number, user: RequestUser): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['category', 'brand', 'merchant'],
    });

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    // 权限验证
    if (!user.isSuperMerchant && product.merchantId !== user.merchantId) {
      throw new NotFoundException('商品不存在');
    }

    return product;
  }

  /**
   * 更新商品
   */
  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    user: RequestUser,
  ): Promise<Product> {
    const product = await this.findOne(id, user);

    // 验证分类和品牌
    if (updateProductDto.categoryId) {
      await this.validateCategory(updateProductDto.categoryId, user.merchantId);
    }

    if (updateProductDto.brandId) {
      await this.validateBrand(updateProductDto.brandId, user.merchantId);
    }

    // 更新基本信息
    Object.assign(product, {
      ...updateProductDto,
      updatedBy: user.userId,
      // 不允许修改的字段
      merchantId: product.merchantId,
      productNo: product.productNo,
    });

    await this.productRepository.save(product);

    return await this.findOne(id, user);
  }

  /**
   * 删除商品（软删除）
   */
  async remove(id: number, user: RequestUser): Promise<void> {
    const product = await this.findOne(id, user);

    product.deletedAt = new Date();
    product.updatedBy = user.userId;

    await this.productRepository.save(product);
  }

  /**
   * 验证分类是否存在且属于当前商户
   */
  private async validateCategory(
    categoryId: number,
    merchantId: number,
  ): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, merchantId },
    });

    if (!category) {
      throw new BadRequestException('分类不存在或无权访问');
    }
  }

  /**
   * 验证品牌是否存在且属于当前商户
   */
  private async validateBrand(
    brandId: number,
    merchantId: number,
  ): Promise<void> {
    const brand = await this.brandRepository.findOne({
      where: { id: brandId, merchantId },
    });

    if (!brand) {
      throw new BadRequestException('品牌不存在或无权访问');
    }
  }

  /**
   * 生成商品编号
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  private async generateProductNo(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `PRD${timestamp}${random}`;
  }
}
