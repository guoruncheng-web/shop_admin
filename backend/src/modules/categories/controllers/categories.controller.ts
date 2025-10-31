import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { TypesGuard } from '../../../auth/guards/types.guard';
import { Types } from '../../../auth/decorators/types.decorator';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { QueryCategoryDto } from '../dto/query-category.dto';

interface RequestUser {
  userId: number;
  merchantId: number;
  username: string;
  isSuperMerchant?: boolean;
}

interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

@ApiTags('商品分类管理')
@Controller('categories')
@UseGuards(JwtAuthGuard, TypesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('tree')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取分类树（不分页）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @Types('product:categories:tree', { name: '查询分类树' })
  async findAllTree(@Request() req: AuthenticatedRequest) {
    const tree = await this.categoriesService.findAllTree(req.user);
    return {
      code: 200,
      message: '查询成功',
      data: tree,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '根据ID查询分类详情' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @Types('product:categories:details', { name: '查询分类详情' })
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const category = await this.categoriesService.findOne(+id, req.user);
    return {
      code: 200,
      message: '查询成功',
      data: category,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '分页查询分类列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @Types('product:categories:view', { name: '查询分类列表' })
  async findAll(
    @Query() query: QueryCategoryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const result = await this.categoriesService.findAll(query, req.user);
    return {
      code: 200,
      message: '查询成功',
      data: {
        list: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建分类' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @Types('product:categories:add', { name: '创建分类' })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const category = await this.categoriesService.create(
      createCategoryDto,
      req.user,
    );
    return {
      code: 201,
      message: '创建成功',
      data: category,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新分类信息' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @Types('product:categories:edit', { name: '更新分类' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const category = await this.categoriesService.update(
      +id,
      updateCategoryDto,
      req.user,
    );
    return {
      code: 200,
      message: '更新成功',
      data: category,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除分类' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  @Types('product:categories:delete', { name: '删除分类' })
  async remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.categoriesService.remove(+id, req.user);
    return {
      code: 200,
      message: '删除成功',
      data: null,
    };
  }

  @Put('batch/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '批量更新分类状态' })
  @ApiResponse({ status: 200, description: '批量更新成功' })
  @Types('product:categories:batchStatus', { name: '批量更新分类状态' })
  async batchUpdateStatus(
    @Body() body: { ids: number[]; status: number },
    @Request() req: AuthenticatedRequest,
  ) {
    await this.categoriesService.batchUpdateStatus(
      body.ids,
      body.status,
      req.user,
    );
    return {
      code: 200,
      message: '批量更新状态成功',
      data: null,
    };
  }
}
