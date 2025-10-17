import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { QueryBrandDto } from '../dto/query-brand.dto';
import { OperationLogService } from '../../operation-log/services/operation-log.service';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    private readonly operationLogService: OperationLogService,
  ) {}

  /**
   * 分页查询品牌列表
   */
  async findAll(
    queryBrandDto: QueryBrandDto,
    merchantId: number,
  ): Promise<{
    code: number;
    message: string;
    data: { list: Brand[]; total: number; page: number; limit: number };
  }> {
    const {
      page = 1,
      limit = 10,
      name,
      status,
      isAuth,
      isHot,
      label,
    } = queryBrandDto;

    const queryBuilder = this.brandRepository
      .createQueryBuilder('brand')
      .where('brand.merchantId = :merchantId', { merchantId });

    // 添加搜索条件
    if (name) {
      queryBuilder.andWhere('brand.name LIKE :name', { name: `%${name}%` });
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

    if (label) {
      queryBuilder.andWhere('JSON_CONTAINS(brand.label, :label)', {
        label: `"${label}"`,
      });
    }

    // 按创建时间倒序排列
    queryBuilder.orderBy('brand.createTime', 'DESC');

    // 分页查询
    const [list, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      code: 200,
      message: '查询成功',
      data: {
        list,
        total,
        page,
        limit,
      },
    };
  }

  /**
   * 查询商户所有品牌（不分页）
   */
  async findAllByMerchant(merchantId: number): Promise<Brand[]> {
    return this.brandRepository.find({
      where: { merchantId },
      order: { createTime: 'DESC' },
    });
  }

  /**
   * 根据ID查询品牌
   */
  async findOne(id: number, merchantId: number): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { id, merchantId },
    });

    if (!brand) {
      throw new NotFoundException(`品牌ID ${id} 不存在`);
    }

    return brand;
  }

  /**
   * 根据名称查询品牌（检查名称唯一性）
   */
  async findByName(name: string, merchantId: number): Promise<Brand | null> {
    return this.brandRepository.findOne({
      where: { name, merchantId },
    });
  }

  /**
   * 创建品牌
   */
  async create(
    createBrandDto: CreateBrandDto,
    merchantId: number,
    creatorId: number,
  ): Promise<Brand> {
    // 检查品牌名称是否已存在
    const existingBrand = await this.findByName(
      createBrandDto.name,
      merchantId,
    );
    if (existingBrand) {
      throw new BadRequestException(`品牌名称 "${createBrandDto.name}" 已存在`);
    }

    const brand = this.brandRepository.create({
      ...createBrandDto,
      merchantId,
      creatorId,
      createTime: new Date(),
      updateTime: new Date(),
    });

    const savedBrand = await this.brandRepository.save(brand);

    // 记录操作日志
    try {
      await this.operationLogService.create({
        module: 'brands',
        operation: 'create',
        description: '新增品牌',
        path: '/brands',
        method: 'POST',
        userId: creatorId,
        username: '',
        merchantId,
        ip: '',
        userAgent: '',
        statusCode: 201,
        executionTime: 0,
        status: 'success',
      });
    } catch (error) {
      console.error('记录操作日志失败:', error);
    }

    return savedBrand;
  }

  /**
   * 更新品牌
   */
  async update(
    id: number,
    updateBrandDto: UpdateBrandDto,
    merchantId: number,
    updaterId: number,
  ): Promise<Brand> {
    const brand = await this.findOne(id, merchantId);

    // 如果更新名称，检查名称唯一性
    if (updateBrandDto.name && updateBrandDto.name !== brand.name) {
      const existingBrand = await this.findByName(
        updateBrandDto.name,
        merchantId,
      );
      if (existingBrand) {
        throw new BadRequestException(
          `品牌名称 "${updateBrandDto.name}" 已存在`,
        );
      }
    }

    // 如果品牌信息发生变化，需要重新认证
    if (updateBrandDto.name || updateBrandDto.iconUrl) {
      updateBrandDto.isAuth = 0; // 设置为未认证
    }

    Object.assign(brand, updateBrandDto);
    brand.updateTime = new Date();

    const updatedBrand = await this.brandRepository.save(brand);

    // 记录操作日志
    try {
      await this.operationLogService.create({
        module: 'brands',
        operation: 'update',
        description: '修改品牌',
        path: `/brands/${id}`,
        method: 'PUT',
        userId: updaterId,
        username: '',
        merchantId,
        ip: '',
        userAgent: '',
        statusCode: 200,
        executionTime: 0,
        status: 'success',
      });
    } catch (error) {
      console.error('记录操作日志失败:', error);
    }

    return updatedBrand;
  }

  /**
   * 删除品牌
   */
  async remove(
    id: number,
    merchantId: number,
    deleterId: number,
  ): Promise<void> {
    const brand = await this.findOne(id, merchantId);

    // TODO: 检查是否有关联的商品，如果有则不允许删除

    await this.brandRepository.remove(brand);

    // 记录操作日志
    try {
      await this.operationLogService.create({
        module: 'brands',
        operation: 'delete',
        description: '删除品牌',
        path: `/brands/${id}`,
        method: 'DELETE',
        userId: deleterId,
        username: '',
        merchantId,
        ip: '',
        userAgent: '',
        statusCode: 200,
        executionTime: 0,
        status: 'success',
      });
    } catch (error) {
      console.error('记录操作日志失败:', error);
    }
  }

  /**
   * 批量更新品牌状态
   */
  async batchUpdateStatus(
    ids: number[],
    status: number,
    merchantId: number,
    updaterId: number,
  ): Promise<void> {
    await this.brandRepository
      .createQueryBuilder()
      .update(Brand)
      .set({ status, updateTime: new Date() })
      .where('id IN (:...ids) AND merchantId = :merchantId', {
        ids,
        merchantId,
      })
      .execute();

    // 记录操作日志
    try {
      await this.operationLogService.create({
        module: 'brands',
        operation: 'batchUpdateStatus',
        description: '批量更新状态',
        path: '/brands/batch-status',
        method: 'PUT',
        userId: updaterId,
        username: '',
        merchantId,
        ip: '',
        userAgent: '',
        statusCode: 200,
        executionTime: 0,
        status: 'success',
      });
    } catch (error) {
      console.error('记录操作日志失败:', error);
    }
  }

  /**
   * 批量认证品牌
   */
  async batchAuth(
    ids: number[],
    isAuth: number,
    merchantId: number,
    autherId: number,
  ): Promise<void> {
    await this.brandRepository
      .createQueryBuilder()
      .update(Brand)
      .set({ isAuth, updateTime: new Date() })
      .where('id IN (:...ids) AND merchantId = :merchantId', {
        ids,
        merchantId,
      })
      .execute();

    // 记录操作日志
    try {
      await this.operationLogService.create({
        module: 'brands',
        operation: 'batchAuth',
        description: '批量认证',
        path: '/brands/batch-auth',
        method: 'PUT',
        userId: autherId,
        username: '',
        merchantId,
        ip: '',
        userAgent: '',
        statusCode: 200,
        executionTime: 0,
        status: 'success',
      });
    } catch (error) {
      console.error('记录操作日志失败:', error);
    }
  }

  /**
   * 获取品牌统计信息
   */
  async getStatistics(merchantId: number): Promise<{
    total: number;
    authenticated: number;
    hot: number;
    active: number;
    unauthenticated: number;
    inactive: number;
  }> {
    const total = await this.brandRepository.count({
      where: { merchantId },
    });

    const authenticated = await this.brandRepository.count({
      where: { merchantId, isAuth: 1 },
    });

    const hot = await this.brandRepository.count({
      where: { merchantId, isHot: 1 },
    });

    const active = await this.brandRepository.count({
      where: { merchantId, status: 1 },
    });

    return {
      total,
      authenticated,
      hot,
      active,
      unauthenticated: total - authenticated,
      inactive: total - active,
    };
  }
}
