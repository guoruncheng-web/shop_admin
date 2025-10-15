import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ResourceService, PaginatedResult } from '../services/resource.service';
import { CreateResourceDto } from '../dto/create-resource.dto';
import { QueryResourceDto } from '../dto/query-resource.dto';
import { Resource } from '../entities/resource.entity';
import {
  OperationLog,
  ModuleNames,
  OperationTypes,
} from '../../operation-log/decorators/operation-log.decorator';
import { Types } from '../../../auth/decorators/types.decorator';
import { TypesGuard } from '../../../auth/guards/types.guard';

@ApiTags('资源管理')
@Controller('resources')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), TypesGuard)
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post()
  @Types('system:resource:create', {
    name: '创建资源',
    module: ModuleNames.FILE,
    operation: OperationTypes.FILE_UPLOAD.operation,
    includeParams: true,
    includeResponse: true,
  })
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.FILE_UPLOAD.operation,
    description: '创建资源',
    includeParams: true,
    includeResponse: true,
  })
  @ApiOperation({ summary: '创建资源' })
  @ApiResponse({ status: 201, description: '创建成功', type: Resource })
  async create(@Body() createDto: CreateResourceDto): Promise<Resource> {
    return await this.resourceService.create(createDto);
  }

  @Get()
  @Types('system:medial:viewPage', {
    name: '分页查询资源',
    module: ModuleNames.FILE,
    operation: OperationTypes.VIEW.operation,
    includeParams: true,
  })
  @ApiOperation({ summary: '分页查询资源' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.VIEW.operation,
    description: '分页查询资源',
    includeParams: true,
  })
  async findAll(
    @Query() queryDto: QueryResourceDto,
  ): Promise<PaginatedResult<Resource>> {
    return await this.resourceService.findAll(queryDto);
  }

  @Get('popular')
  @Types('system:resource:view', {
    name: '获取热门资源',
    module: ModuleNames.FILE,
    operation: OperationTypes.VIEW.operation,
    includeParams: true,
  })
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.VIEW.operation,
    description: '获取热门资源',
    includeParams: true,
  })
  @ApiOperation({ summary: '获取热门资源' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Resource] })
  async getPopular(
    @Query('limit', ParseIntPipe) limit: number = 20,
  ): Promise<Resource[]> {
    return await this.resourceService.getPopularResources(limit);
  }

  @Get('latest')
  @Types('system:resource:view', {
    name: '获取最新资源',
    module: ModuleNames.FILE,
    operation: OperationTypes.VIEW.operation,
    includeParams: true,
  })
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.VIEW.operation,
    description: '获取最新资源',
    includeParams: true,
  })
  @ApiOperation({ summary: '获取最新资源' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Resource] })
  async getLatest(
    @Query('limit', ParseIntPipe) limit: number = 20,
  ): Promise<Resource[]> {
    return await this.resourceService.getLatestResources(limit);
  }

  @Get('search')
  @Types('system:resource:view', {
    name: '搜索资源',
    module: ModuleNames.FILE,
    operation: OperationTypes.VIEW.operation,
    includeParams: true,
  })
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.VIEW.operation,
    description: '搜索资源',
    includeParams: true,
  })
  @ApiOperation({ summary: '搜索资源' })
  @ApiResponse({ status: 200, description: '搜索成功', type: [Resource] })
  async search(
    @Query('keyword') keyword: string,
    @Query('limit', ParseIntPipe) limit: number = 50,
  ): Promise<Resource[]> {
    return await this.resourceService.searchResources(keyword, limit);
  }

  @Get('statistics')
  @Types('system:resource:view', {
    name: '获取资源统计信息',
    module: ModuleNames.FILE,
    operation: OperationTypes.VIEW.operation,
  })
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.VIEW.operation,
    description: '获取资源统计信息',
  })
  @ApiOperation({ summary: '获取资源统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStatistics() {
    return await this.resourceService.getStatistics();
  }

  @Get(':id')
  @Types('system:resource:view', {
    name: '获取资源详情',
    module: ModuleNames.FILE,
    operation: OperationTypes.VIEW.operation,
    businessIdField: 'id',
  })
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.VIEW.operation,
    description: '获取资源详情',
    businessIdField: 'id',
  })
  @ApiOperation({ summary: '获取资源详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: Resource })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Resource> {
    const resource = await this.resourceService.findOne(id);
    // 增加查看次数
    await this.resourceService.incrementViewCount(id);
    return resource;
  }

  @Put(':id')
  @Types('system:resource:edit', {
    name: '更新资源',
    module: ModuleNames.FILE,
    operation: OperationTypes.FILE_UPLOAD.operation,
    includeParams: true,
    includeResponse: true,
    businessIdField: 'id',
  })
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.FILE_UPLOAD.operation,
    description: '更新资源',
    includeParams: true,
    includeResponse: true,
    businessIdField: 'id',
  })
  @ApiOperation({ summary: '更新资源' })
  @ApiResponse({ status: 200, description: '更新成功', type: Resource })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: Partial<CreateResourceDto>,
  ): Promise<Resource> {
    return await this.resourceService.update(id, updateDto);
  }

  @Delete(':id')
  @Types('system:resource:delete', {
    name: '删除资源',
    module: ModuleNames.FILE,
    operation: OperationTypes.FILE_DELETE.operation,
    businessIdField: 'id',
  })
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.FILE_DELETE.operation,
    description: '删除资源',
    businessIdField: 'id',
  })
  @ApiOperation({ summary: '删除资源' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.resourceService.delete(id);
    return { message: '删除成功' };
  }

  @Post(':id/download')
  @Types('system:resource:download', {
    name: '记录资源下载',
    module: ModuleNames.FILE,
    operation: 'download',
    businessIdField: 'id',
  })
  @OperationLog({
    module: ModuleNames.FILE,
    operation: 'download',
    description: '记录资源下载',
    businessIdField: 'id',
  })
  @ApiOperation({ summary: '记录资源下载' })
  @ApiResponse({ status: 200, description: '记录成功' })
  async recordDownload(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.resourceService.incrementDownloadCount(id);
    return { message: '下载记录成功' };
  }
}
