import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from '../../../auth/decorators/public.decorator';
import { ResourceCategoryService } from '../services/resource-category.service';
import { CreateResourceCategoryDto } from '../dto/create-resource-category.dto';
import { ResourceCategory } from '../entities/resource-category.entity';
import { Types } from '../../../auth/decorators/types.decorator';
@ApiTags('资源分类管理')
@Controller('resource-categories')
@ApiBearerAuth()
export class ResourceCategoryController {
  constructor(private readonly categoryService: ResourceCategoryService) {}

  @Post()
  @ApiOperation({ summary: '创建资源分类' })
  @ApiResponse({ status: 201, description: '创建成功', type: ResourceCategory })
  @Types('system:medialCategory:add', {
    name: '创建资源分类',
    module: 'medialCategory',
    operation: 'add',
    includeParams: false,
  })
  async create(
    @Body() createDto: CreateResourceCategoryDto,
  ): Promise<ResourceCategory> {
    return await this.categoryService.create(createDto);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取分类树结构' })
  @Types('system:medialCategory:view', {
    name: '查看资源分类',
    module: 'medialCategory',
    operation: 'view',
    includeParams: false,
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [ResourceCategory],
  })
  async getTree(): Promise<ResourceCategory[]> {
    return await this.categoryService.getTree();
  }

  @Get('second-level')
  @ApiOperation({ summary: '获取二级分类列表（用于资源上传）' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [ResourceCategory],
  })
  @Types('system:medialCategory:view', {
    name: '查看二级分类列表',
    module: 'medialCategory',
    operation: 'view',
    includeParams: false,
  })
  async getSecondLevelCategories(): Promise<ResourceCategory[]> {
    return await this.categoryService.getSecondLevelCategories();
  }

  @Put(':id')
  @ApiOperation({ summary: '更新资源分类' })
  @ApiResponse({ status: 200, description: '更新成功', type: ResourceCategory })
  @Types('system:medialCategory:edit', {
    name: '更新资源分类',
    module: 'medialCategory',
    operation: 'edit',
    includeParams: false,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<CreateResourceCategoryDto>,
  ): Promise<ResourceCategory> {
    return await this.categoryService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除资源分类' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @Types('system:medialCategory:delete', {
    name: '删除资源分类',
    module: 'medialCategory',
    operation: 'delete',
    includeParams: false,
  })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.categoryService.delete(id);
    return { message: '删除成功' };
  }
}
