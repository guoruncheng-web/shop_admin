import {
  Controller,
  Get,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { OperationLogService } from '../services/operation-log.service';
import { QueryOperationLogDto } from '../dto/operation-log.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { Types } from '../../../auth/decorators/types.decorator';
import {
  OperationLog,
  ModuleNames,
  OperationTypes,
} from '../decorators/operation-log.decorator';

@ApiTags('操作日志管理')
@Controller('operation-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OperationLogController {
  constructor(private readonly operationLogService: OperationLogService) {}

  @Get()
  @ApiOperation({
    summary: '获取操作日志列表',
    description: '分页获取操作日志列表，支持多种筛选条件',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              userId: { type: 'number' },
              username: { type: 'string' },
              module: { type: 'string' },
              operation: { type: 'string' },
              description: { type: 'string' },
              method: { type: 'string' },
              path: { type: 'string' },
              ip: { type: 'string' },
              location: { type: 'string' },
              statusCode: { type: 'number' },
              executionTime: { type: 'number' },
              status: { type: 'string', enum: ['success', 'failed'] },
              createdAt: { type: 'string', format: 'date-time' },
              merchantId: { type: 'number' },
              merchant: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  merchantCode: { type: 'string' },
                  merchantName: { type: 'string' },
                  merchantType: { type: 'number' },
                },
              },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  username: { type: 'string' },
                  realName: { type: 'string' },
                  avatar: { type: 'string' },
                },
              },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            pageSize: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
        msg: { type: 'string', example: '获取成功' },
      },
    },
  })
  @ApiQuery({
    name: 'merchantId',
    required: false,
    description: '商户ID，用于筛选特定商户的操作日志',
    type: 'number',
  })
  @ApiQuery({
    name: 'merchantName',
    required: false,
    description: '商户名称，支持模糊搜索',
    type: 'string',
  })
  @Types('system:operationLog:view', {
    name: '查看操作日志',
    module: 'system',
    operation: 'view',
    includeParams: true,
  })
  @OperationLog({
    module: ModuleNames.SYSTEM,
    operation: OperationTypes.VIEW.operation,
    description: '查看操作日志',
    includeParams: true,
    includeResponse: false,
  })
  async findAll(@Query() query: QueryOperationLogDto) {
    return this.operationLogService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({
    summary: '获取操作日志统计',
    description: '获取操作日志的统计信息，包括操作数量、成功率等',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: '统计天数',
    example: 7,
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            totalOperations: { type: 'number' },
            successOperations: { type: 'number' },
            failedOperations: { type: 'number' },
            successRate: { type: 'number' },
            avgExecutionTime: { type: 'number' },
            moduleStats: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  module: { type: 'string' },
                  count: { type: 'number' },
                },
              },
            },
            operationStats: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  operation: { type: 'string' },
                  count: { type: 'number' },
                },
              },
            },
            activeUsers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  count: { type: 'number' },
                },
              },
            },
          },
        },
        msg: { type: 'string', example: '获取成功' },
      },
    },
  })
  @Types('system:operationLog:statistics', {
    name: '查看操作日志统计',
    module: 'system',
    operation: 'view',
  })
  @OperationLog({
    module: ModuleNames.SYSTEM,
    operation: OperationTypes.VIEW.operation,
    description: '查看操作日志统计',
  })
  async getStatistics(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 7;
    return this.operationLogService.getStatistics(daysNumber);
  }

  @Get('modules')
  @ApiOperation({
    summary: '获取模块列表',
    description: '获取所有操作日志中的模块列表',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'array',
          items: { type: 'string' },
        },
        msg: { type: 'string', example: '获取成功' },
      },
    },
  })
  async getModules() {
    const modules = await this.operationLogService.getModules();
    return {
      code: 200,
      data: modules,
      msg: '获取成功',
    };
  }

  @Get('operations')
  @ApiOperation({
    summary: '获取操作类型列表',
    description: '获取所有操作日志中的操作类型列表',
  })
  @ApiQuery({
    name: 'module',
    required: false,
    description: '模块名称，用于筛选特定模块的操作类型',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'array',
          items: { type: 'string' },
        },
        msg: { type: 'string', example: '获取成功' },
      },
    },
  })
  async getOperations(@Query('module') module?: string) {
    const operations = await this.operationLogService.getOperations(module);
    return {
      code: 200,
      data: operations,
      msg: '获取成功',
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: '获取操作日志详情',
    description: '根据ID获取操作日志的详细信息',
  })
  @ApiParam({
    name: 'id',
    description: '操作日志ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
  })
  @ApiResponse({
    status: 404,
    description: '操作日志不存在',
  })
  @Types('system:operationLog:viewDetails', {
    name: '查看操作日志详情',
    module: 'system',
    operation: 'view',
  })
  @OperationLog({
    module: ModuleNames.SYSTEM,
    operation: OperationTypes.VIEW.operation,
    description: '查看操作日志详情',
    businessIdField: 'id',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const operationLog = await this.operationLogService.findOne(id);
    if (!operationLog) {
      return {
        code: 404,
        data: null,
        msg: '操作日志不存在',
      };
    }
    return {
      code: 200,
      data: operationLog,
      msg: '获取成功',
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: '删除操作日志',
    description: '根据ID删除指定的操作日志',
  })
  @ApiParam({
    name: 'id',
    description: '操作日志ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '删除成功',
  })
  @Types('system:operationLog:delete', {
    name: '删除操作日志',
    module: 'system',
    operation: 'delete',
  })
  @OperationLog({
    module: ModuleNames.SYSTEM,
    operation: OperationTypes.USER_DELETE.operation,
    description: '删除操作日志',
    businessIdField: 'id',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.operationLogService.remove(id);
    return {
      code: 200,
      data: null,
      msg: '删除成功',
    };
  }

  @Post('batch-delete')
  @ApiOperation({
    summary: '批量删除操作日志',
    description: '根据ID数组批量删除操作日志',
  })
  @ApiResponse({
    status: 200,
    description: '批量删除成功',
  })
  @Types('system:operationLog:deleteBatch', {
    name: '批量删除操作日志',
    module: 'system',
    operation: 'delete',
    includeParams: true,
  })
  @OperationLog({
    module: ModuleNames.SYSTEM,
    operation: OperationTypes.USER_DELETE.operation,
    description: '批量删除操作日志',
    includeParams: true,
  })
  async batchRemove(@Body() body: { ids: number[] }) {
    const { ids } = body;
    if (!ids || ids.length === 0) {
      return {
        code: 400,
        data: null,
        msg: '请选择要删除的记录',
      };
    }

    await this.operationLogService.batchRemove(ids);
    return {
      code: 200,
      data: null,
      msg: `批量删除成功，共删除 ${ids.length} 条记录`,
    };
  }

  @Post('clear-old')
  @ApiOperation({
    summary: '清理过期日志',
    description: '清理指定天数之前的操作日志',
  })
  @ApiResponse({
    status: 200,
    description: '清理成功',
  })
  @Types('system:operationLog:clearHistory', {
    name: '清理过期操作日志',
    module: 'system',
    operation: 'clear',
    includeParams: true,
  })
  @OperationLog({
    module: ModuleNames.SYSTEM,
    operation: OperationTypes.SYSTEM_LOG_CLEAR.operation,
    description: '清理过期操作日志',
    includeParams: true,
  })
  async clearOldLogs(@Body() body: { days: number }) {
    const { days = 30 } = body;
    const deletedCount = await this.operationLogService.clearOldLogs(days);
    return {
      code: 200,
      data: { deletedCount },
      msg: `清理成功，共删除 ${deletedCount} 条过期日志`,
    };
  }

  @Post('clear-all')
  @ApiOperation({
    summary: '清空所有日志',
    description: '清空所有操作日志（谨慎操作）',
  })
  @ApiResponse({
    status: 200,
    description: '清空成功',
  })
  @Types('system:operationLog:clearAll', {
    name: '清空所有操作日志',
    module: 'system',
    operation: 'clear',
  })
  @OperationLog({
    module: ModuleNames.SYSTEM,
    operation: OperationTypes.SYSTEM_LOG_CLEAR.operation,
    description: '清空所有操作日志',
  })
  async clearAllLogs() {
    const deletedCount = await this.operationLogService.clearAllLogs();
    return {
      code: 200,
      data: { deletedCount },
      msg: `清空成功，共删除 ${deletedCount} 条日志`,
    };
  }
}
