import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceCategory } from '../entities/resource-category.entity';
import { CreateResourceCategoryDto } from '../dto/create-resource-category.dto';

@Injectable()
export class ResourceCategoryService {
  constructor(
    @InjectRepository(ResourceCategory)
    private readonly categoryRepository: Repository<ResourceCategory>,
  ) {}

  /**
   * 创建分类
   */
  async create(createDto: CreateResourceCategoryDto): Promise<ResourceCategory> {
    // 验证分类层级规则
    if (createDto.level === 1 && createDto.parentId) {
      throw new BadRequestException('一级分类不能有父分类');
    }
    
    if (createDto.level === 2 && !createDto.parentId) {
      throw new BadRequestException('二级分类必须指定父分类');
    }

    // 验证父分类是否存在且为一级分类
    if (createDto.parentId) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: createDto.parentId, level: 1, status: 1 }
      });
      
      if (!parentCategory) {
        throw new BadRequestException('父分类不存在或不是有效的一级分类');
      }
    }

    const category = this.categoryRepository.create(createDto);
    return await this.categoryRepository.save(category);
  }

  /**
   * 获取分类树
   */
  async getTree(): Promise<ResourceCategory[]> {
    const categories = await this.categoryRepository.find({
      where: { status: 1 },
      order: { level: 'ASC', sortOrder: 'ASC', id: 'ASC' }
    });

    // 构建树形结构
    const categoryMap = new Map<number, ResourceCategory>();
    const rootCategories: ResourceCategory[] = [];

    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id);
      if (category.level === 1) {
        rootCategories.push(categoryWithChildren);
      } else if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(categoryWithChildren);
        }
      }
    });

    return rootCategories;
  }

  /**
   * 获取二级分类列表（用于资源上传）
   */
  async getSecondLevelCategories(): Promise<ResourceCategory[]> {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent')
      .where('category.level = 2 AND category.status = 1')
      .orderBy('parent.sortOrder', 'ASC')
      .addOrderBy('category.sortOrder', 'ASC')
      .getMany();
  }

  /**
   * 更新分类
   */
  async update(id: number, updateDto: Partial<CreateResourceCategoryDto>): Promise<ResourceCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 如果更新层级或父分类，需要验证
    if (updateDto.level !== undefined || updateDto.parentId !== undefined) {
      const level = updateDto.level ?? category.level;
      const parentId = updateDto.parentId ?? category.parentId;

      if (level === 1 && parentId) {
        throw new BadRequestException('一级分类不能有父分类');
      }
      
      if (level === 2 && !parentId) {
        throw new BadRequestException('二级分类必须指定父分类');
      }
    }

    Object.assign(category, updateDto);
    return await this.categoryRepository.save(category);
  }

  /**
   * 删除分类（软删除）
   */
  async delete(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children', 'resources']
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 检查是否有子分类
    if (category.children && category.children.length > 0) {
      throw new BadRequestException('该分类下还有子分类，无法删除');
    }

    // 检查是否有资源
    if (category.resources && category.resources.length > 0) {
      throw new BadRequestException('该分类下还有资源，无法删除');
    }

    category.status = 0;
    await this.categoryRepository.save(category);
  }

  /**
   * 验证分类是否为二级分类
   */
  async validateSecondLevelCategory(categoryId: number): Promise<boolean> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, level: 2, status: 1 }
    });
    return !!category;
  }
}