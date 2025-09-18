import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Role } from '../../../database/entities/role.entity';
import { Permission } from '../../../database/entities/permission.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { QueryRoleDto } from '../dto/query-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  /**
   * 获取所有角色列表（不分页）
   */
  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['permissions'],
    });
  }

  /**
   * 分页查询角色列表
   */
  async findWithPagination(query: QueryRoleDto) {
    const { page = 1, pageSize = 10, name, code, status } = query;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.roleRepository.createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .orderBy('role.createdAt', 'DESC');

    // 添加搜索条件
    if (name) {
      queryBuilder.andWhere('role.name LIKE :name', { name: `%${name}%` });
    }
    if (code) {
      queryBuilder.andWhere('role.code LIKE :code', { code: `%${code}%` });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('role.status = :status', { status });
    }

    const [list, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 根据ID获取角色详情
   */
  async findById(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    return role;
  }

  /**
   * 创建角色
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, code, description, status, permissionIds } = createRoleDto;

    // 检查角色代码是否已存在
    const existingRole = await this.roleRepository.findOne({
      where: { code },
    });
    if (existingRole) {
      throw new BadRequestException('角色代码已存在');
    }

    // 创建角色
    const role = this.roleRepository.create({
      name,
      code,
      description,
      status: status ?? 1,
    });

    // 处理权限关联
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findByIds(permissionIds);
      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  /**
   * 更新角色
   */
  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const { permissionIds, ...roleData } = updateRoleDto;

    const role = await this.findById(id);

    // 更新基本信息
    Object.assign(role, roleData);

    // 处理权限关联
    if (permissionIds !== undefined) {
      if (permissionIds.length > 0) {
        const permissions = await this.permissionRepository.findByIds(permissionIds);
        role.permissions = permissions;
      } else {
        role.permissions = [];
      }
    }

    return this.roleRepository.save(role);
  }

  /**
   * 删除角色
   */
  async delete(id: number): Promise<void> {
    const role = await this.findById(id);

    // 检查是否有管理员使用此角色
    const roleWithAdmins = await this.roleRepository.findOne({
      where: { id },
      relations: ['admins'],
    });

    if (roleWithAdmins?.admins && roleWithAdmins.admins.length > 0) {
      throw new BadRequestException('该角色正在被使用，无法删除');
    }

    await this.roleRepository.remove(role);
  }

  /**
   * 切换角色状态
   */
  async toggleStatus(id: number): Promise<Role> {
    const role = await this.findById(id);
    role.status = role.status === 1 ? 0 : 1;
    return this.roleRepository.save(role);
  }
}