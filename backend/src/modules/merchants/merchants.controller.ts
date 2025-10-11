import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { QueryMerchantDto } from './dto/query-merchant.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('商户管理')
@Controller('merchants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Post()
  @ApiOperation({ summary: '创建商户' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 409, description: '商户编码已存在' })
  async create(@Body() createMerchantDto: CreateMerchantDto, @Request() req) {
    const merchant = await this.merchantsService.create(
      createMerchantDto,
      req.user,
    );
    return {
      code: 200,
      data: merchant,
      msg: '创建成功',
    };
  }

  @Get()
  @ApiOperation({ summary: '查询商户列表（分页）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Query() query: QueryMerchantDto) {
    return await this.merchantsService.findAll(query);
  }

  @Get('code/:merchantCode')
  @ApiOperation({ summary: '根据商户编码查询' })
  @ApiParam({ name: 'merchantCode', description: '商户编码' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '商户不存在' })
  async findByCode(@Param('merchantCode') merchantCode: string) {
    const merchant = await this.merchantsService.findByCode(merchantCode);
    return {
      code: 200,
      data: merchant,
      msg: '查询成功',
    };
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: '获取商户统计信息' })
  @ApiParam({ name: 'id', description: '商户ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getStatistics(@Param('id') id: string) {
    return await this.merchantsService.getStatistics(+id);
  }

  @Get(':id/super-admin')
  @ApiOperation({ summary: '获取商户超级管理员信息' })
  @ApiParam({ name: 'id', description: '商户ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '商户或管理员不存在' })
  async getSuperAdmin(@Param('id') id: string) {
    const admin = await this.merchantsService.getSuperAdmin(+id);
    return {
      code: 200,
      data: admin,
      msg: '查询成功',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '查询单个商户详情' })
  @ApiParam({ name: 'id', description: '商户ID' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '商户不存在' })
  async findOne(@Param('id') id: string) {
    const merchant = await this.merchantsService.findOne(+id);
    return {
      code: 200,
      data: merchant,
      msg: '查询成功',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新商户信息' })
  @ApiParam({ name: 'id', description: '商户ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '商户不存在' })
  @ApiResponse({ status: 409, description: '商户编码已存在' })
  async update(
    @Param('id') id: string,
    @Body() updateMerchantDto: UpdateMerchantDto,
    @Request() req,
  ) {
    const merchant = await this.merchantsService.update(
      +id,
      updateMerchantDto,
      req.user,
    );
    return {
      code: 200,
      data: merchant,
      msg: '更新成功',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除商户' })
  @ApiParam({ name: 'id', description: '商户ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '商户不存在' })
  @ApiResponse({ status: 400, description: '超级商户不允许删除' })
  async remove(@Param('id') id: string) {
    await this.merchantsService.remove(+id);
    return {
      code: 200,
      data: null,
      msg: '删除成功',
    };
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新商户状态' })
  @ApiParam({ name: 'id', description: '商户ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: number },
    @Request() req,
  ) {
    const merchant = await this.merchantsService.updateStatus(
      +id,
      body.status,
      req.user,
    );
    return {
      code: 200,
      data: merchant,
      msg: '状态更新成功',
    };
  }

  @Put(':id/certification')
  @ApiOperation({ summary: '更新商户认证状态' })
  @ApiParam({ name: 'id', description: '商户ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateCertificationStatus(
    @Param('id') id: string,
    @Body() body: { certificationStatus: number },
    @Request() req,
  ) {
    const merchant = await this.merchantsService.updateCertificationStatus(
      +id,
      body.certificationStatus,
      req.user,
    );
    return {
      code: 200,
      data: merchant,
      msg: '认证状态更新成功',
    };
  }

  @Post(':id/reset-super-admin-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '重置商户超级管理员密码' })
  @ApiParam({ name: 'id', description: '商户ID' })
  @ApiResponse({ status: 200, description: '重置成功，返回新密码（仅此次）' })
  @ApiResponse({ status: 404, description: '商户或管理员不存在' })
  async resetSuperAdminPassword(@Param('id') id: string, @Request() req) {
    const credentials = await this.merchantsService.resetSuperAdminPassword(
      +id,
      req.user,
    );
    return {
      code: 200,
      data: credentials,
      msg: '密码重置成功，请妥善保存新密码',
    };
  }

  @Post(':id/regenerate-keys')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '重新生成商户API密钥对' })
  @ApiParam({ name: 'id', description: '商户ID' })
  @ApiResponse({ status: 200, description: '生成成功' })
  async regenerateApiKeys(@Param('id') id: string, @Request() req) {
    const keys = await this.merchantsService.regenerateApiKeys(+id, req.user);
    return {
      code: 200,
      data: keys,
      msg: 'API密钥对重新生成成功',
    };
  }
}
