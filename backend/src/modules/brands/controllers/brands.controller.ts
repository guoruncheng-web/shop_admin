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
import { BrandsService } from '../services/brands.service';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { QueryBrandDto } from '../dto/query-brand.dto';

// 定义请求用户接口
interface RequestUser {
  userId: number;
  merchantId: number;
  username: string;
}

// 定义扩展的请求接口
interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

// 定义品牌响应类型
interface BrandResponse {
  code: number;
  message: string;
  data: unknown;
}

// 定义分页响应类型
interface PaginatedBrandResponse {
  code: number;
  message: string;
  data: {
    list: unknown[];
    total: number;
    page: number;
    limit: number;
  };
}

@ApiTags('品牌管理')
@Controller('brands')
@UseGuards(JwtAuthGuard, TypesGuard)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '分页查询品牌列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @Types('system:brands:view', { name: '查询品牌列表' })
  async findAll(
    @Query() query: QueryBrandDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<PaginatedBrandResponse> {
    const merchantId = req.user?.merchantId;
    return await this.brandsService.findAll(query, merchantId);
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '查询所有品牌（不分页）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @Types('system:brands:viewAll', { name: '查询所有品牌' })
  async findAllBrands(
    @Request() req: AuthenticatedRequest,
  ): Promise<BrandResponse> {
    const merchantId = req.user?.merchantId;
    const brands = await this.brandsService.findAllByMerchant(merchantId);
    return {
      code: 200,
      message: '查询成功',
      data: brands,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '根据ID查询品牌详情' })
  @ApiParam({ name: 'id', description: '品牌ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '品牌不存在' })
  @Types('system:brands:details', { name: '查询品牌详情' })
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<BrandResponse> {
    const merchantId = req.user?.merchantId;
    const brand = await this.brandsService.findOne(+id, merchantId);
    return {
      code: 200,
      message: '查询成功',
      data: brand,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建品牌' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '品牌名称已存在' })
  @Types('system:brands:add', { name: '创建品牌' })
  async create(
    @Body() createBrandDto: CreateBrandDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<BrandResponse> {
    const creatorId = req.user?.userId;
    const merchantId = req.user?.merchantId;

    const brand = await this.brandsService.create(
      createBrandDto,
      merchantId,
      creatorId,
    );
    return {
      code: 201,
      message: '创建成功',
      data: brand,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新品牌信息' })
  @ApiParam({ name: 'id', description: '品牌ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '品牌不存在' })
  @Types('system:brands:edit', { name: '更新品牌' })
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<BrandResponse> {
    const merchantId = req.user?.merchantId;
    const updaterId = req.user?.userId;

    const brand = await this.brandsService.update(
      +id,
      updateBrandDto,
      merchantId,
      updaterId,
    );
    return {
      code: 200,
      message: '更新成功',
      data: brand,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除品牌' })
  @ApiParam({ name: 'id', description: '品牌ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '品牌不存在' })
  @Types('system:brands:delete', { name: '删除品牌' })
  async remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<BrandResponse> {
    const merchantId = req.user?.merchantId;
    const deleterId = req.user?.userId;

    await this.brandsService.remove(+id, merchantId, deleterId);
    return {
      code: 200,
      message: '删除成功',
      data: null,
    };
  }
}
