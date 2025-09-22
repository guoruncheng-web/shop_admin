import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Resource, ResourceStatus, ResourceType } from '../entities/resource.entity';
import { CreateResourceDto } from '../dto/create-resource.dto';
import { QueryResourceDto } from '../dto/query-resource.dto';
import { ResourceCategoryService } from './resource-category.service';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    private readonly categoryService: ResourceCategoryService,
  ) {}

  /**
   * 创建资源
   */
  async create(createDto: CreateResourceDto): Promise<Resource> {
    // 验证分类是否为二级分类
    const isValidCategory = await this.categoryService.validateSecondLevelCategory(createDto.categoryId);
    if (!isValidCategory) {
      throw new BadRequestException('只能在二级分类下上传资源');
    }

    const resource = this.resourceRepository.create({
      ...createDto,
      tags: createDto.tags ? createDto.tags.join(',') : null,
    });

    return await this.resourceRepository.save(resource);
  }

  /**
   * 分页查询资源
   */
  async findAll(queryDto: QueryResourceDto): Promise<PaginatedResult<Resource>> {
    const { page, pageSize, ...filters } = queryDto;
    
    let queryBuilder = this.resourceRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.category', 'category')
      .leftJoinAndSelect('category.parent', 'parentCategory');

    // 应用过滤条件
    queryBuilder = this.applyFilters(queryBuilder, filters);

    // 排序
    const sortBy = queryDto.sortBy || 'uploadedAt';
    const sortOrder = queryDto.sortOrder || 'DESC';
    queryBuilder.orderBy(`resource.${sortBy}`, sortOrder);

    // 分页
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 应用查询过滤条件
   */
  private applyFilters(queryBuilder: SelectQueryBuilder<Resource>, filters: any): SelectQueryBuilder<Resource> {
    if (filters.name) {
      queryBuilder.andWhere('resource.name LIKE :name', { name: `%${filters.name}%` });
    }

    if (filters.type) {
      queryBuilder.andWhere('resource.type = :type', { type: filters.type });
    }

    if (filters.categoryId) {
      queryBuilder.andWhere('resource.categoryId = :categoryId', { categoryId: filters.categoryId });
    }

    if (filters.uploaderId) {
      queryBuilder.andWhere('resource.uploaderId = :uploaderId', { uploaderId: filters.uploaderId });
    }

    if (filters.status !== undefined) {
      queryBuilder.andWhere('resource.status = :status', { status: filters.status });
    } else {
      // 默认只显示正常状态的资源
      queryBuilder.andWhere('resource.status >= 0');
    }

    if (filters.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags.map((tag, index) => 
        `FIND_IN_SET(:tag${index}, resource.tags) > 0`
      ).join(' OR ');
      
      queryBuilder.andWhere(`(${tagConditions})`);
      
      filters.tags.forEach((tag, index) => {
        queryBuilder.setParameter(`tag${index}`, tag);
      });
    }

    return queryBuilder;
  }

  /**
   * 根据ID获取资源详情
   */
  async findOne(id: number): Promise<Resource> {
    const resource = await this.resourceRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.category', 'category')
      .leftJoinAndSelect('category.parent', 'parentCategory')
      .where('resource.id = :id', { id })
      .getOne();

    if (!resource) {
      throw new NotFoundException('资源不存在');
    }

    return resource;
  }

  /**
   * 更新资源
   */
  async update(id: number, updateDto: Partial<CreateResourceDto>): Promise<Resource> {
    const resource = await this.findOne(id);

    // 如果更新分类，需要验证
    if (updateDto.categoryId && updateDto.categoryId !== resource.categoryId) {
      const isValidCategory = await this.categoryService.validateSecondLevelCategory(updateDto.categoryId);
      if (!isValidCategory) {
        throw new BadRequestException('只能在二级分类下上传资源');
      }
    }

    Object.assign(resource, {
      ...updateDto,
      tags: updateDto.tags ? updateDto.tags.join(',') : resource.tags,
    });

    return await this.resourceRepository.save(resource);
  }

  /**
   * 删除资源（软删除）
   */
  async delete(id: number): Promise<void> {
    const resource = await this.findOne(id);
    resource.status = ResourceStatus.DELETED;
    await this.resourceRepository.save(resource);
  }

  /**
   * 增加查看次数
   */
  async incrementViewCount(id: number): Promise<void> {
    await this.resourceRepository.increment({ id }, 'viewCount', 1);
  }

  /**
   * 增加下载次数
   */
  async incrementDownloadCount(id: number): Promise<void> {
    await this.resourceRepository.increment({ id }, 'downloadCount', 1);
  }

  /**
   * 获取热门资源
   */
  async getPopularResources(limit: number = 20): Promise<Resource[]> {
    return await this.resourceRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.category', 'category')
      .leftJoinAndSelect('category.parent', 'parentCategory')
      .where('resource.status = :status', { status: ResourceStatus.ACTIVE })
      .orderBy('resource.downloadCount', 'DESC')
      .addOrderBy('resource.viewCount', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * 获取最新资源
   */
  async getLatestResources(limit: number = 20): Promise<Resource[]> {
    return await this.resourceRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.category', 'category')
      .leftJoinAndSelect('category.parent', 'parentCategory')
      .where('resource.status = :status', { status: ResourceStatus.ACTIVE })
      .orderBy('resource.uploadedAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * 全文搜索资源
   */
  async searchResources(keyword: string, limit: number = 50): Promise<Resource[]> {
    return await this.resourceRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.category', 'category')
      .leftJoinAndSelect('category.parent', 'parentCategory')
      .where('resource.status = :status', { status: ResourceStatus.ACTIVE })
      .andWhere('(resource.name LIKE :keyword OR resource.description LIKE :keyword)', 
        { keyword: `%${keyword}%` })
      .orderBy('resource.uploadedAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * 获取统计信息
   */
  async getStatistics() {
    const totalResources = await this.resourceRepository.count({ 
      where: { status: ResourceStatus.ACTIVE } 
    });

    const imageCount = await this.resourceRepository.count({ 
      where: { status: ResourceStatus.ACTIVE, type: ResourceType.IMAGE } 
    });

    const videoCount = await this.resourceRepository.count({ 
      where: { status: ResourceStatus.ACTIVE, type: ResourceType.VIDEO } 
    });

    const totalSize = await this.resourceRepository
      .createQueryBuilder('resource')
      .select('SUM(resource.fileSize)', 'totalSize')
      .where('resource.status = :status', { status: ResourceStatus.ACTIVE })
      .getRawOne();

    const totalDownloads = await this.resourceRepository
      .createQueryBuilder('resource')
      .select('SUM(resource.downloadCount)', 'totalDownloads')
      .where('resource.status = :status', { status: ResourceStatus.ACTIVE })
      .getRawOne();

    return {
      totalResources,
      imageCount,
      videoCount,
      totalSize: parseInt(totalSize?.totalSize || '0'),
      totalDownloads: parseInt(totalDownloads?.totalDownloads || '0'),
    };
  }
}