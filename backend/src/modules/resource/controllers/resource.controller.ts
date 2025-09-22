import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators/public.decorator';
import { ResourceService, PaginatedResult } from '../services/resource.service';
import { CreateResourceDto } from '../dto/create-resource.dto';
import { QueryResourceDto } from '../dto/query-resource.dto';
import { Resource } from '../entities/resource.entity';

@ApiTags('资源管理')
@Controller('resources')
@Public() // 暂时公开访问，用于测试
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post()
  @ApiOperation({ summary: '创建资源' })
  @ApiResponse({ status: 201, description: '创建成功', type: Resource })
  async create(@Body() createDto: CreateResourceDto): Promise<Resource> {
    return await this.resourceService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: '分页查询资源' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Query() queryDto: QueryResourceDto): Promise<PaginatedResult<Resource>> {
    return await this.resourceService.findAll(queryDto);
  }

  @Get('popular')
  @ApiOperation({ summary: '获取热门资源' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Resource] })
  async getPopular(@Query('limit', ParseIntPipe) limit: number = 20): Promise<Resource[]> {
    return await this.resourceService.getPopularResources(limit);
  }

  @Get('latest')
  @ApiOperation({ summary: '获取最新资源' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Resource] })
  async getLatest(@Query('limit', ParseIntPipe) limit: number = 20): Promise<Resource[]> {
    return await this.resourceService.getLatestResources(limit);
  }

  @Get('search')
  @ApiOperation({ summary: '搜索资源' })
  @ApiResponse({ status: 200, description: '搜索成功', type: [Resource] })
  async search(
    @Query('keyword') keyword: string,
    @Query('limit', ParseIntPipe) limit: number = 50
  ): Promise<Resource[]> {
    return await this.resourceService.searchResources(keyword, limit);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取资源统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStatistics() {
    return await this.resourceService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取资源详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: Resource })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Resource> {
    const resource = await this.resourceService.findOne(id);
    // 增加查看次数
    await this.resourceService.incrementViewCount(id);
    return resource;
  }

  @Put(':id')
  @ApiOperation({ summary: '更新资源' })
  @ApiResponse({ status: 200, description: '更新成功', type: Resource })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<CreateResourceDto>
  ): Promise<Resource> {
    return await this.resourceService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除资源' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.resourceService.delete(id);
    return { message: '删除成功' };
  }

  @Post(':id/download')
  @ApiOperation({ summary: '记录资源下载' })
  @ApiResponse({ status: 200, description: '记录成功' })
  async recordDownload(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.resourceService.incrementDownloadCount(id);
    return { message: '下载记录成功' };
  }
}