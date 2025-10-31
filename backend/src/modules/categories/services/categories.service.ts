import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { QueryCategoryDto } from '../dto/query-category.dto';

interface RequestUser {
  userId: number;
  merchantId: number;
  username: string;
  isSuperMerchant?: boolean;
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * 创建分类
   */
  async create(
    createCategoryDto: CreateCategoryDto,
    user: RequestUser,
  ): Promise<Category> {
    const { parentId = 0, categoryName, ...rest } = createCategoryDto;

    // 检查父分类
    let level = 1;
    let pathIds = '0';
    let pathNames = '';

    if (parentId > 0) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: parentId, merchantId: user.merchantId },
      });

      if (!parentCategory) {
        throw new NotFoundException('父分类不存在');
      }

      if (parentCategory.level >= 3) {
        throw new BadRequestException('最多支持三级分类');
      }

      level = parentCategory.level + 1;
      pathIds = `${parentCategory.pathIds},${parentCategory.id}`;
      pathNames = parentCategory.pathNames
        ? `${parentCategory.pathNames},${parentCategory.categoryName}`
        : parentCategory.categoryName;
    }

    // 检查分类名称是否重复（同一商户下同一父分类下）
    const existCategory = await this.categoryRepository.findOne({
      where: {
        merchantId: user.merchantId,
        parentId,
        categoryName,
      },
    });

    if (existCategory) {
      throw new BadRequestException('分类名称已存在');
    }

    const category = this.categoryRepository.create({
      ...rest,
      merchantId: user.merchantId,
      parentId,
      categoryName,
      level,
      pathIds,
      pathNames,
      createdBy: user.userId,
      updatedBy: user.userId,
    });

    return await this.categoryRepository.save(category);
  }

  /**
   * 分页查询分类列表
   */
  async findAll(query: QueryCategoryDto, user: RequestUser) {
    const {
      page = 1,
      limit = 10,
      categoryName,
      categoryCode,
      parentId,
      level,
      isShow,
      isRecommend,
      status,
      merchantId,
    } = query;

    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.merchant', 'merchant');

    // 商户隔离：平台超级商户可以查询所有，普通商户只能查询自己的
    if (user.isSuperMerchant && merchantId) {
      queryBuilder.andWhere('category.merchantId = :merchantId', {
        merchantId,
      });
    } else if (!user.isSuperMerchant) {
      queryBuilder.andWhere('category.merchantId = :merchantId', {
        merchantId: user.merchantId,
      });
    }

    // 条件筛选
    if (categoryName) {
      queryBuilder.andWhere('category.categoryName LIKE :categoryName', {
        categoryName: `%${categoryName}%`,
      });
    }

    if (categoryCode) {
      queryBuilder.andWhere('category.categoryCode = :categoryCode', {
        categoryCode,
      });
    }

    if (parentId !== undefined) {
      queryBuilder.andWhere('category.parentId = :parentId', { parentId });
    }

    if (level) {
      queryBuilder.andWhere('category.level = :level', { level });
    }

    if (isShow !== undefined) {
      queryBuilder.andWhere('category.isShow = :isShow', { isShow });
    }

    if (isRecommend !== undefined) {
      queryBuilder.andWhere('category.isRecommend = :isRecommend', {
        isRecommend,
      });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('category.status = :status', { status });
    }

    // 排序
    queryBuilder.orderBy('category.sort', 'DESC');
    queryBuilder.addOrderBy('category.createdAt', 'DESC');

    // 分页
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * 查询所有分类（树形结构，不分页）
   */
  async findAllTree(user: RequestUser): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      where: { merchantId: user.merchantId, status: 1 },
      order: { sort: 'DESC', createdAt: 'ASC' },
    });

    return this.buildTree(categories, 0);
  }

  /**
   * 构建树形结构
   */
  private buildTree(categories: Category[], parentId: number): Category[] {
    const tree: Category[] = [];

    for (const category of categories) {
      if (category.parentId === parentId) {
        const children = this.buildTree(categories, category.id);
        if (children.length > 0) {
          (category as any).children = children;
        }
        tree.push(category);
      }
    }

    return tree;
  }

  /**
   * 查询单个分类详情
   */
  async findOne(id: number, user: RequestUser): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['merchant', 'parent'],
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // 权限校验
    if (!user.isSuperMerchant && category.merchantId !== user.merchantId) {
      throw new ForbiddenException('无权访问此分类');
    }

    return category;
  }

  /**
   * 更新分类
   */
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    user: RequestUser,
  ): Promise<Category> {
    const category = await this.findOne(id, user);

    // 如果更改了父分类，需要重新计算路径
    if (
      updateCategoryDto.parentId !== undefined &&
      updateCategoryDto.parentId !== category.parentId
    ) {
      const { parentId } = updateCategoryDto;

      if (parentId === id) {
        throw new BadRequestException('父分类不能是自己');
      }

      let level = 1;
      let pathIds = '0';
      let pathNames = '';

      if (parentId > 0) {
        const parentCategory = await this.categoryRepository.findOne({
          where: { id: parentId, merchantId: user.merchantId },
        });

        if (!parentCategory) {
          throw new NotFoundException('父分类不存在');
        }

        if (parentCategory.level >= 3) {
          throw new BadRequestException('最多支持三级分类');
        }

        level = parentCategory.level + 1;
        pathIds = `${parentCategory.pathIds},${parentCategory.id}`;
        pathNames = parentCategory.pathNames
          ? `${parentCategory.pathNames},${parentCategory.categoryName}`
          : parentCategory.categoryName;
      }

      Object.assign(category, {
        level,
        pathIds,
        pathNames,
      });
    }

    // 检查名称重复
    if (updateCategoryDto.categoryName) {
      const existCategory = await this.categoryRepository.findOne({
        where: {
          merchantId: user.merchantId,
          parentId: category.parentId,
          categoryName: updateCategoryDto.categoryName,
        },
      });

      if (existCategory && existCategory.id !== id) {
        throw new BadRequestException('分类名称已存在');
      }
    }

    Object.assign(category, {
      ...updateCategoryDto,
      updatedBy: user.userId,
    });

    return await this.categoryRepository.save(category);
  }

  /**
   * 删除分类
   */
  async remove(id: number, user: RequestUser): Promise<void> {
    const category = await this.findOne(id, user);

    // 检查是否有子分类
    const childrenCount = await this.categoryRepository.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new BadRequestException('该分类下存在子分类，无法删除');
    }

    // 检查是否有商品
    if (category.productCount > 0) {
      throw new BadRequestException('该分类下存在商品，无法删除');
    }

    await this.categoryRepository.remove(category);
  }

  /**
   * 批量更新状态
   */
  async batchUpdateStatus(
    ids: number[],
    status: number,
    user: RequestUser,
  ): Promise<void> {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder()
      .update(Category)
      .set({ status, updatedBy: user.userId })
      .where('id IN (:...ids)', { ids });

    if (!user.isSuperMerchant) {
      queryBuilder.andWhere('merchantId = :merchantId', {
        merchantId: user.merchantId,
      });
    }

    await queryBuilder.execute();
  }
}
