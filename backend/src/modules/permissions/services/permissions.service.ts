import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Permission } from '../../../database/entities/permission.entity';
import { Role } from '../../../database/entities/role.entity';
import { Menu } from '../../menus/entities/menu.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { QueryPermissionDto } from '../dto/query-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  /**
   * 获取权限树形结构
   */
  async getPermissionTree(): Promise<any[]> {
    // 获取所有权限
    const permissions = await this.permissionRepository.find({
      where: { status: 1 },
      order: { id: 'ASC' },
    });

    // 获取所有菜单数据并转换为权限格式
    const menus = await this.menuRepository.find({
      where: { status: 1 },
      order: { orderNum: 'ASC' },
    });

    // 将菜单转换为权限格式
    const menuPermissions = menus.map((menu) => ({
      id: `menu_${menu.id}`, // 使用前缀避免ID冲突
      name: menu.title || menu.name,
      code: menu.buttonKey || `menu:${menu.name}`,
      type: menu.type === 1 ? 'menu' : menu.type === 2 ? 'menu' : 'button',
      parentId: menu.parentId ? `menu_${menu.parentId}` : null,
      menuId: menu.id, // 保留原始菜单ID
      status: menu.status,
      description: menu.name || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // 合并权限和菜单数据
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const allPermissions = [...permissions, ...menuPermissions] as any[];

    // 如果有数据，构建树形结构
    if (allPermissions.length > 0) {
      return this.buildPermissionTree(allPermissions);
    }

    // 如果数据库中没有权限数据，返回模拟数据
    const treeData = [
      {
        id: 1,
        name: '系统管理',
        code: 'system',
        type: 'menu',
        children: [
          {
            id: 11,
            name: '用户管理',
            code: 'system:user',
            type: 'menu',
            parentId: 1,
            children: [
              {
                id: 111,
                name: '查看用户',
                code: 'system:user:view',
                type: 'button',
                parentId: 11,
              },
              {
                id: 112,
                name: '新增用户',
                code: 'system:user:add',
                type: 'button',
                parentId: 11,
              },
              {
                id: 113,
                name: '编辑用户',
                code: 'system:user:edit',
                type: 'button',
                parentId: 11,
              },
              {
                id: 114,
                name: '删除用户',
                code: 'system:user:delete',
                type: 'button',
                parentId: 11,
              },
            ],
          },
          {
            id: 12,
            name: '角色管理',
            code: 'system:role',
            type: 'menu',
            parentId: 1,
            children: [
              {
                id: 121,
                name: '查看角色',
                code: 'system:role:view',
                type: 'button',
                parentId: 12,
              },
              {
                id: 122,
                name: '新增角色',
                code: 'system:role:add',
                type: 'button',
                parentId: 12,
              },
              {
                id: 123,
                name: '编辑角色',
                code: 'system:role:edit',
                type: 'button',
                parentId: 12,
              },
              {
                id: 124,
                name: '删除角色',
                code: 'system:role:delete',
                type: 'button',
                parentId: 12,
              },
              {
                id: 125,
                name: '分配权限',
                code: 'system:role:assign',
                type: 'button',
                parentId: 12,
              },
            ],
          },
          {
            id: 13,
            name: '菜单管理',
            code: 'system:menu',
            type: 'menu',
            parentId: 1,
            children: [
              {
                id: 131,
                name: '查看菜单',
                code: 'system:menu:view',
                type: 'button',
                parentId: 13,
              },
              {
                id: 132,
                name: '新增菜单',
                code: 'system:menu:add',
                type: 'button',
                parentId: 13,
              },
              {
                id: 133,
                name: '编辑菜单',
                code: 'system:menu:edit',
                type: 'button',
                parentId: 13,
              },
              {
                id: 134,
                name: '删除菜单',
                code: 'system:menu:delete',
                type: 'button',
                parentId: 13,
              },
            ],
          },
        ],
      },
      {
        id: 2,
        name: '商品管理',
        code: 'product',
        type: 'menu',
        children: [
          {
            id: 21,
            name: '商品列表',
            code: 'product:list',
            type: 'menu',
            parentId: 2,
            children: [
              {
                id: 211,
                name: '查看商品',
                code: 'product:view',
                type: 'button',
                parentId: 21,
              },
              {
                id: 212,
                name: '新增商品',
                code: 'product:add',
                type: 'button',
                parentId: 21,
              },
              {
                id: 213,
                name: '编辑商品',
                code: 'product:edit',
                type: 'button',
                parentId: 21,
              },
              {
                id: 214,
                name: '删除商品',
                code: 'product:delete',
                type: 'button',
                parentId: 21,
              },
            ],
          },
          {
            id: 22,
            name: '分类管理',
            code: 'product:category',
            type: 'menu',
            parentId: 2,
            children: [
              {
                id: 221,
                name: '查看分类',
                code: 'product:category:view',
                type: 'button',
                parentId: 22,
              },
              {
                id: 222,
                name: '新增分类',
                code: 'product:category:add',
                type: 'button',
                parentId: 22,
              },
              {
                id: 223,
                name: '编辑分类',
                code: 'product:category:edit',
                type: 'button',
                parentId: 22,
              },
              {
                id: 224,
                name: '删除分类',
                code: 'product:category:delete',
                type: 'button',
                parentId: 22,
              },
            ],
          },
        ],
      },
      {
        id: 3,
        name: '订单管理',
        code: 'order',
        type: 'menu',
        children: [
          {
            id: 31,
            name: '订单列表',
            code: 'order:list',
            type: 'menu',
            parentId: 3,
            children: [
              {
                id: 311,
                name: '查看订单',
                code: 'order:view',
                type: 'button',
                parentId: 31,
              },
              {
                id: 312,
                name: '处理订单',
                code: 'order:process',
                type: 'button',
                parentId: 31,
              },
              {
                id: 313,
                name: '取消订单',
                code: 'order:cancel',
                type: 'button',
                parentId: 31,
              },
            ],
          },
        ],
      },
    ];

    return treeData;
  }

  /**
   * 根据数据库权限数据构建树形结构
   */
  private buildPermissionTree(permissions: Permission[]): any[] {
    // 创建权限映射
    const permissionMap = new Map<number, any>();
    const rootPermissions: any[] = [];

    // 先创建所有权限节点
    permissions.forEach((permission) => {
      const node = {
        id: permission.id,
        name: permission.name,
        code: permission.code,
        type: permission.type,
        parentId: permission.parentId,
        children: [],
      };
      permissionMap.set(permission.id, node);
    });

    // 构建树形结构
    permissions.forEach((permission) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const node = permissionMap.get(permission.id);
      if (permission.parentId && permissionMap.has(permission.parentId)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const parent = permissionMap.get(permission.parentId);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        parent.children.push(node);
      } else {
        rootPermissions.push(node);
      }
    });

    return rootPermissions;
  }

  /**
   * 分页查询权限列表
   */
  async findWithPagination(query: QueryPermissionDto) {
    const { page = 1, pageSize = 10, name, code, status } = query;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.permissionRepository
      .createQueryBuilder('permission')
      .orderBy('permission.createdAt', 'DESC');

    // 添加搜索条件
    if (name) {
      queryBuilder.andWhere('permission.name LIKE :name', {
        name: `%${name}%`,
      });
    }
    if (code) {
      queryBuilder.andWhere('permission.code LIKE :code', {
        code: `%${code}%`,
      });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('permission.status = :status', { status });
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
   * 根据ID获取权限详情
   */
  async findById(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('权限不存在');
    }

    return permission;
  }

  /**
   * 创建权限
   */
  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const { name, code, description, status } = createPermissionDto;

    // 检查权限代码是否已存在
    const existingPermission = await this.permissionRepository.findOne({
      where: { code },
    });
    if (existingPermission) {
      throw new BadRequestException('权限代码已存在');
    }

    const permission = this.permissionRepository.create({
      name,
      code,
      description,
      status: status ?? 1,
    });

    return this.permissionRepository.save(permission);
  }

  /**
   * 更新权限
   */
  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.findById(id);

    // 如果更新代码，检查是否重复
    if (
      updatePermissionDto.code &&
      updatePermissionDto.code !== permission.code
    ) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { code: updatePermissionDto.code },
      });
      if (existingPermission) {
        throw new BadRequestException('权限代码已存在');
      }
    }

    Object.assign(permission, updatePermissionDto);
    return this.permissionRepository.save(permission);
  }

  /**
   * 删除权限
   */
  async delete(id: number): Promise<void> {
    const permission = await this.findById(id);

    // 检查是否有角色使用此权限
    const permissionWithRoles = await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (permissionWithRoles?.roles && permissionWithRoles.roles.length > 0) {
      throw new BadRequestException('该权限正在被使用，无法删除');
    }

    await this.permissionRepository.remove(permission);
  }

  /**
   * 获取角色权限列表
   */
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    return role.permissions || [];
  }

  /**
   * 分配角色权限
   */
  async assignRolePermissions(
    roleId: number,
    permissionIds: number[],
  ): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 使用事务确保数据一致性
    await this.roleRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // 先清除该角色的所有权限关联
        await transactionalEntityManager.query(
          'DELETE FROM role_permissions WHERE role_id = ?',
          [roleId],
        );

        // 如果有新权限需要分配，则批量插入
        if (permissionIds && permissionIds.length > 0) {
          // 验证权限是否存在
          const permissions = await transactionalEntityManager.find(
            Permission,
            {
              where: { id: In(permissionIds) },
            },
          );

          if (permissions.length !== permissionIds.length) {
            throw new BadRequestException('部分权限不存在');
          }

          // 批量插入新的权限关联
          const values = permissionIds
            .map((permissionId) => `(${roleId}, ${permissionId})`)
            .join(', ');
          await transactionalEntityManager.query(
            `INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`,
          );
        }
      },
    );
  }
}
