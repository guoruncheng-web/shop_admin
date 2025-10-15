import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service';
import {
  OperationLog,
  ModuleNames,
  OperationTypes,
} from '../../operation-log/decorators/operation-log.decorator';

@ApiTags('分类管理')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @OperationLog({
    module: ModuleNames.CATEGORY,
    operation: OperationTypes.VIEW.operation,
    description: '获取分类列表',
  })
  findAll() {
    return this.categoriesService.findAll();
  }
}
