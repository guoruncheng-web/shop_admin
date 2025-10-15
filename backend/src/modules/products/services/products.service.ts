import { Injectable } from '@nestjs/common';
import {
  OperationLog,
  ModuleNames,
  OperationTypes,
} from '../../operation-log/decorators/operation-log.decorator';

@Injectable()
export class ProductsService {
  @OperationLog({
    module: ModuleNames.PRODUCT,
    operation: OperationTypes.VIEW.operation,
    description: '获取商品列表',
  })
  findAll() {
    return {
      message: 'Products service is working',
      data: [],
    };
  }
}
