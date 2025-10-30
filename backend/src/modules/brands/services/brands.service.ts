import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, Not } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';
// edited: use QueryBrandDto instead of BrandQueryDto
import { QueryBrandDto } from '../dto/query-brand.dto';
import { OperationLogService } from '../../operation-log/services/operation-log.service';
import { CurrentUser } from '../interfaces/brand.interface';

interface BrandRawResult {
  brand_id: number;
  brand_name: string;
  brand_iconUrl: string;
  brand_status: number;
  brand_isAuth: number;
  brand_isHot: number;
  brand_label: string[];
  brand_creator: number;
  brand_createTime: Date;
  brand_updateTime: Date;
  merchantId: number;
  merchantName: string;
  merchantStatus: number;
  creatorName: string;
}

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    private readonly dataSource: DataSource,
    private readonly operationLogService: OperationLogService,
  ) {}

  /**
   * 创建品牌
   */
  async create(
    createBrandDto: CreateBrandDto,
    currentUser: CurrentUser,
  ): Promise<Brand> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // 检查品牌名称是否已存在（同一商户下）
      const existingBrand = await queryRunner.manager.findOne(Brand, {
        where: {
          name: createBrandDto.name,
          merchantId: currentUser.merchantId,
        },
      });

      if (existingBrand) {
        throw new ConflictException(`品牌名称 "${createBrandDto.name}" 已存在`);
      }

      // 创建品牌实体
      const brand = new Brand();
      brand.name = createBrandDto.name;
      brand.iconUrl = createBrandDto.iconUrl;
      brand.status = createBrandDto.status ?? true;
      brand.merchantId = currentUser.merchantId;
      brand.isAuth = createBrandDto.isAuth ?? false;
      brand.isHot = createBrandDto.isHot ?? false;
      brand.creator = currentUser.userId;
      brand.createTime = new Date();
      brand.updateTime = new Date();

      // 修复：正确处理 JSON 字段
      if (createBrandDto.label && Array.isArray(createBrandDto.label)) {
        // MySQL JSON 类型需要特殊处理，使用 JSON 函数
        brand.label = createBrandDto.label;
      } else {
        brand.label = [];
      }

      // 保存品牌
      const savedBrand = await queryRunner.manager.save(brand);

      // 记录操作日志
      await this.operationLogService.logOperation(
        currentUser,
        'brand',
        savedBrand.id,
        'CREATE',
        `创建品牌: ${savedBrand.name}`,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();

      // 返回保存后的品牌（包含数据库生成的字段）
      return await this.findOne(savedBrand.id, currentUser);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 分页查询品牌列表
   */
  async findAll(
    query: QueryBrandDto,
    currentUser: CurrentUser,
  ): Promise<{ items: any[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 10,
      name,
      status,
      isAuth,
      isHot,
      merchantId,
      creator,
      label,
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.brandRepository
      .createQueryBuilder('brand')
      .leftJoinAndSelect(
        'merchants',
        'merchant',
        'brand.merchantId = merchant.id',
      )
      .leftJoinAndSelect('admins', 'admin', 'brand.creator = admin.id');

    // 超级商户查询所有品牌,普通商户只查询自己的品牌
    // 假设平台超级商户的merchantId为1
    if (currentUser.merchantId !== 1) {
      queryBuilder.where('brand.merchantId = :merchantId', {
        merchantId: currentUser.merchantId,
      });
    }

    // 添加搜索条件
    if (merchantId !== undefined) {
      if (currentUser.merchantId === 1) {
        queryBuilder.andWhere('brand.merchantId = :searchMerchantId', {
          searchMerchantId: merchantId,
        });
      }
    }

    if (name) {
      queryBuilder.andWhere('brand.name LIKE :name', {
        name: `%${name}%`,
      });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('brand.status = :status', { status });
    }

    if (isAuth !== undefined) {
      queryBuilder.andWhere('brand.isAuth = :isAuth', { isAuth });
    }

    if (isHot !== undefined) {
      queryBuilder.andWhere('brand.isHot = :isHot', { isHot });
    }

    if (creator) {
      queryBuilder.andWhere('admin.username LIKE :creator', {
        creator: `%${creator}%`,
      });
    }

    if (label) {
      queryBuilder.andWhere('JSON_CONTAINS(brand.label, :label)', {
        label: JSON.stringify(label),
      });
    }

    // 获取总数
    const total = await queryBuilder.getCount();

    // 获取分页数据
    const results: BrandRawResult[] = await queryBuilder
      .select([
        'brand.id as brand_id',
        'brand.name as brand_name',
        'brand.iconUrl as brand_iconUrl',
        'brand.status as brand_status',
        'brand.isAuth as brand_isAuth',
        'brand.isHot as brand_isHot',
        'brand.label as brand_label',
        'brand.creator as brand_creator',
        'brand.createTime as brand_createTime',
        'brand.updateTime as brand_updateTime',
        'merchant.id as merchantId',
        'merchant.merchantName as merchantName',
        'merchant.status as merchantStatus',
        'admin.username as creatorName',
      ])
      .orderBy('brand.createTime', 'DESC')
      .offset(skip)
      .limit(limit)
      .getRawMany();

    // 格式化返回数据,包含商户信息
    const items = results.map((row: BrandRawResult) => ({
      id: row.brand_id,
      name: row.brand_name,
      iconUrl: row.brand_iconUrl,
      status: row.brand_status,
      isAuth: row.brand_isAuth,
      isHot: row.brand_isHot,
      label: row.brand_label,
      creator: row.brand_creator,
      createTime: row.brand_createTime,
      updateTime: row.brand_updateTime,
      merchant: {
        id: row.merchantId,
        name: row.merchantName,
        status: row.merchantStatus,
      },
      creatorInfo: {
        username: row.creatorName,
      },
    }));

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * 根据ID查找品牌
   */
  async findOne(id: number, currentUser: CurrentUser): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: {
        id,
        merchantId: currentUser.merchantId,
      },
    });

    if (!brand) {
      throw new NotFoundException(`品牌ID ${id} 不存在`);
    }

    return brand;
  }

  /**
   * 更新品牌
   */
  async update(
    id: number,
    updateBrandDto: UpdateBrandDto,
    currentUser: CurrentUser,
  ): Promise<Brand> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const brand = await queryRunner.manager.findOne(Brand, {
        where: {
          id,
          merchantId: currentUser.merchantId,
        },
      });

      if (!brand) {
        throw new NotFoundException(`品牌ID ${id} 不存在`);
      }

      // 检查品牌名称是否已被其他品牌使用
      if (updateBrandDto.name && updateBrandDto.name !== brand.name) {
        const existingBrand = await queryRunner.manager.findOne(Brand, {
          where: {
            name: updateBrandDto.name,
            merchantId: currentUser.merchantId,
            id: Not(id),
          },
        });

        if (existingBrand) {
          throw new ConflictException(
            `品牌名称 "${updateBrandDto.name}" 已被其他品牌使用`,
          );
        }
      }

      // 更新字段
      Object.assign(brand, updateBrandDto);
      brand.updateTime = new Date();

      // 修复：正确处理 JSON 字段
      if (updateBrandDto.label !== undefined) {
        if (Array.isArray(updateBrandDto.label)) {
          brand.label = updateBrandDto.label;
        } else {
          brand.label = [];
        }
      }

      // 保存更新
      const updatedBrand = await queryRunner.manager.save(brand);

      // 记录操作日志
      await this.operationLogService.logOperation(
        currentUser,
        'brand',
        updatedBrand.id,
        'UPDATE',
        `更新品牌: ${updatedBrand.name}`,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();

      return await this.findOne(id, currentUser);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 删除品牌
   */
  async remove(id: number, currentUser: CurrentUser): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const brand = await queryRunner.manager.findOne(Brand, {
        where: {
          id,
          merchantId: currentUser.merchantId,
        },
      });

      if (!brand) {
        throw new NotFoundException(`品牌ID ${id} 不存在`);
      }

      // 检查是否有商品关联该品牌
      const productCount = await queryRunner.manager.query(
        'SELECT COUNT(*) as count FROM products WHERE brand_id = ?',
        [id],
      );

      if (productCount[0].count > 0) {
        throw new BadRequestException(
          `该品牌下还有 ${productCount[0].count} 个商品，无法删除。请先删除或转移这些商品。`,
        );
      }

      await queryRunner.manager.remove(brand);

      // 记录操作日志
      await this.operationLogService.logOperation(
        currentUser,
        'brand',
        id,
        'DELETE',
        `删除品牌: ${brand.name}`,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 批量更新品牌状态
   */
  async batchUpdateStatus(
    ids: number[],
    status: boolean,
    currentUser: CurrentUser,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // 验证所有品牌都属于当前商户
      const brands = await queryRunner.manager.find(Brand, {
        where: {
          id: In(ids),
          merchantId: currentUser.merchantId,
        },
      });

      if (brands.length !== ids.length) {
        throw new BadRequestException('部分品牌不存在或不属于当前商户');
      }

      // 批量更新状态
      await queryRunner.manager.update(Brand, ids, {
        status,
        updateTime: new Date(),
      });

      // 记录操作日志
      await this.operationLogService.logOperation(
        currentUser,
        'brand',
        null,
        'BATCH_UPDATE_STATUS',
        `批量更新品牌状态: ${status}, 品牌数量: ${ids.length}`,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 批量更新品牌认证状态
   */
  async batchUpdateAuth(
    ids: number[],
    isAuth: boolean,
    currentUser: CurrentUser,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // 验证所有品牌都属于当前商户
      const brands = await queryRunner.manager.find(Brand, {
        where: {
          id: In(ids),
          merchantId: currentUser.merchantId,
        },
      });

      if (brands.length !== ids.length) {
        throw new BadRequestException('部分品牌不存在或不属于当前商户');
      }

      // 批量更新认证状态
      await queryRunner.manager.update(Brand, ids, {
        isAuth,
        updateTime: new Date(),
      });

      // 记录操作日志
      await this.operationLogService.logOperation(
        currentUser,
        'brand',
        null,
        'BATCH_UPDATE_AUTH',
        `批量更新品牌认证状态: ${isAuth}, 品牌数量: ${ids.length}`,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取品牌统计信息
   */
  async getStatistics(currentUser: CurrentUser): Promise<any> {
    const queryBuilder = this.brandRepository
      .createQueryBuilder('brand')
      .where('brand.merchantId = :merchantId', {
        merchantId: currentUser.merchantId,
      });

    const total = await queryBuilder.getCount();
    const active = await queryBuilder
      .andWhere('brand.status = :status', { status: true })
      .getCount();
    const authenticated = await queryBuilder
      .andWhere('brand.isAuth = :isAuth', { isAuth: true })
      .getCount();
    const hot = await queryBuilder
      .andWhere('brand.isHot = :isHot', { isHot: true })
      .getCount();

    return {
      total,
      active,
      inactive: total - active,
      authenticated,
      unauthenticated: total - authenticated,
      hot,
      notHot: total - hot,
    };
  }

  /**
   * 获取所有品牌（不分页，用于下拉选择等场景）
   */
  async findAllActive(currentUser: CurrentUser): Promise<Brand[]> {
    return this.brandRepository.find({
      where: {
        merchantId: currentUser.merchantId,
        status: true,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  // added: fetch all brands by merchant (no status filter)
  async findAllByMerchant(merchantId: number): Promise<Brand[]> {
    return this.brandRepository.find({
      where: { merchantId },
      order: { name: 'ASC' },
    });
  }
}
