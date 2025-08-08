import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoriesService {
  findAll() {
    return {
      message: 'Categories service is working',
      data: [],
    };
  }
}
