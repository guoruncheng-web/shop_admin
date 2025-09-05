import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../../../database/entities/admin.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  // 根据ID获取用户
  async findById(id: number): Promise<Admin> {
    const user = await this.adminRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  // 根据用户名获取用户
  async findByUsername(username: string): Promise<Admin> {
    const user = await this.adminRepository.findOne({
      where: { username },
    });

    return user;
  }
}