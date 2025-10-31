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
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { QueryProductDto } from '../dto/query-product.dto';

interface RequestUser {
  userId: number;
  merchantId: number;
  username: string;
  isSuperMerchant?: boolean;
}

interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

interface ApiResponseType<T = any> {
  code: number;
  message: string;
  data: T;
}

interface PaginatedResponse<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

@ApiTags('商品管理')
@Controller('products')
@UseGuards(JwtAuthGuard, TypesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '分页查询商品列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @Types('product:products:view', { name: '查询商品列表' })
  async findAll(
    @Query() query: QueryProductDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseType<PaginatedResponse>> {
    const result = await this.productsService.findAll(query, req.user);
    return {
      code: 200,
      message: '查询成功',
      data: {
        list: result.list,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      },
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '查询商品详情' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  @Types('product:products:details', { name: '查询商品详情' })
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseType> {
    const product = await this.productsService.findOne(+id, req.user);
    return {
      code: 200,
      message: '查询成功',
      data: product,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建商品' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @Types('product:products:add', { name: '创建商品' })
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseType> {
    const product = await this.productsService.create(
      createProductDto,
      req.user,
    );
    return {
      code: 201,
      message: '创建成功',
      data: product,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  @Types('product:products:edit', { name: '更新商品' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseType> {
    const product = await this.productsService.update(
      +id,
      updateProductDto,
      req.user,
    );
    return {
      code: 200,
      message: '更新成功',
      data: product,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  @Types('product:products:delete', { name: '删除商品' })
  async remove(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseType<null>> {
    await this.productsService.remove(+id, req.user);
    return {
      code: 200,
      message: '删除成功',
      data: null,
    };
  }
}
