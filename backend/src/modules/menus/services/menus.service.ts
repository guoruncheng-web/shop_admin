import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository, Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { CreateMenuDto, MenuType } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { QueryMenuDto } from '../dto/query-menu.dto';
import { Admin } from '../../../database/entities/admin.entity';
import { Role } from '../../../database/entities/role.entity';
import { Permission } from '../../../database/entities/permission.entity';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: TreeRepository<Menu>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  // 创建菜单
  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    const { parentId, ...menuData } = createMenuDto;

    const menu = this.menuRepository.create(menuData);

    // 如果有父级菜单，设置父级关系
    if (parentId && parentId > 0) {
      const parent = await this.menuRepository.findOne({
        where: { id: parentId },
      });
      if (!parent) {
        throw new NotFoundException('父级菜单不存在');
      }

      // 验证三级菜单结构
      this.validateMenuHierarchy(parent, menu.type);

      menu.parent = parent;
    } else {
      // 根级菜单只能是目录类型
      if (menu.type !== 1) {
        throw new BadRequestException('根级菜单只能是目录类型');
      }
    }

    // 验证按钮类型必须有buttonKey
    if (menu.type === 3 && !menu.buttonKey) {
      throw new BadRequestException('按钮类型菜单必须设置按钮标识');
    }

    return this.menuRepository.save(menu);
  }

  // 验证菜单层级结构
  private validateMenuHierarchy(parent: Menu, childType: number): void {
    // 获取父级菜单的层级深度
    const parentDepth = this.getMenuDepth(parent);

    if (parentDepth >= 3) {
      throw new BadRequestException('菜单最多只能有三级结构');
    }

    // 验证层级规则
    if (parent.type === 1 && childType === 1) {
      throw new BadRequestException('目录下不能直接创建目录，只能创建菜单');
    }

    if (parent.type === 2 && childType !== 3) {
      throw new BadRequestException('菜单下只能创建按钮');
    }

    if (parent.type === 3) {
      throw new BadRequestException('按钮下不能创建子菜单');
    }
  }

  // 获取菜单深度
  private getMenuDepth(menu: Menu): number {
    let depth = 1;
    let current = menu;

    while (current.parent) {
      depth++;
      current = current.parent;
    }

    return depth;
  }

  // 获取菜单树
  async getMenuTree(query: QueryMenuDto = {}): Promise<Menu[]> {
    const { name, type, status, visible } = query;

    const queryBuilder = this.menuRepository.createQueryBuilder('menu');

    if (name) {
      queryBuilder.andWhere('menu.name LIKE :name', { name: `%${name}%` });
    }

    if (type !== undefined) {
      queryBuilder.andWhere('menu.type = :type', { type });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('menu.status = :status', { status });
    }

    if (visible !== undefined) {
      queryBuilder.andWhere('menu.visible = :visible', { visible });
    }

    queryBuilder.orderBy('menu.sort', 'ASC');

    return this.menuRepository.findTrees();
  }

  // 分页查询菜单
  async getMenus(query: QueryMenuDto): Promise<Menu[]> {
    const { name, type, status, visible } = query;

    const queryBuilder = this.menuRepository.createQueryBuilder('menu');

    if (name) {
      queryBuilder.andWhere('menu.name LIKE :name', { name: `%${name}%` });
    }

    if (type !== undefined) {
      queryBuilder.andWhere('menu.type = :type', { type });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('menu.status = :status', { status });
    }

    if (visible !== undefined) {
      queryBuilder.andWhere('menu.visible = :visible', { visible });
    }

    const data = await queryBuilder.orderBy('menu.sort', 'ASC').getMany();

    return data;
  }

  // 根据ID获取菜单
  async getMenuById(id: number): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    return menu;
  }

  // 更新菜单
  async update(id: number, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.getMenuById(id);
    const { parentId, ...updateData } = updateMenuDto;

    // 检查是否将菜单设置为自己的子菜单
    if (parentId === id) {
      throw new BadRequestException('不能将菜单设置为自己的子菜单');
    }

    // 如果有父级菜单，设置父级关系
    if (parentId !== undefined) {
      if (parentId === 0) {
        menu.parent = null;
        // 根级菜单只能是目录类型
        if (updateData.type && updateData.type !== MenuType.DIRECTORY) {
          throw new BadRequestException('根级菜单只能是目录类型');
        }
      } else if (parentId > 0) {
        const parent = await this.menuRepository.findOne({
          where: { id: parentId },
        });
        if (!parent) {
          throw new NotFoundException('父级菜单不存在');
        }

        // 验证三级菜单结构
        this.validateMenuHierarchy(parent, updateData.type || menu.type);
        menu.parent = parent;
      }
    }

    // 验证按钮类型必须有buttonKey
    if (
      updateData.type === MenuType.BUTTON &&
      !updateData.buttonKey &&
      !menu.buttonKey
    ) {
      throw new BadRequestException('按钮类型菜单必须设置按钮标识');
    }

    Object.assign(menu, updateData);
    return this.menuRepository.save(menu);
  }

  // 删除菜单
  async delete(id: number): Promise<void> {
    const menu = await this.getMenuById(id);

    // 检查是否有子菜单
    const children = await this.menuRepository.findDescendants(menu);
    if (children.length > 1) {
      // 包含自己，所以长度大于1表示有子菜单
      throw new BadRequestException('请先删除子菜单');
    }

    await this.menuRepository.remove(menu);
  }

  // 根据用户ID获取菜单（支持多角色，自动去重）
  async getUserMenusByUserId(userId: number): Promise<Menu[]> {
    // 获取用户及其角色和权限
    const user = await this.adminRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 收集用户所有角色的权限ID（去重）
    const permissionIds = new Set<number>();
    user.roles.forEach((role) => {
      if (role.status === 1) {
        // 只考虑启用的角色
        role.permissions.forEach((permission) => {
          if (permission.status === 1) {
            // 只考虑启用的权限
            permissionIds.add(permission.id);
          }
        });
      }
    });

    // 查询菜单（包含目录、菜单和按钮类型）
    const queryBuilder = this.menuRepository
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.permission', 'permission')
      .leftJoinAndSelect('menu.parent', 'parent')
      .where('menu.status = :status', { status: true })
      .andWhere('menu.visible = :visible', { visible: true });

    // 如果有权限限制，只返回有权限的菜单
    if (permissionIds.size > 0) {
      queryBuilder.andWhere(
        '(menu.permissionId IS NULL OR menu.permissionId IN (:...permissionIds))',
        {
          permissionIds: Array.from(permissionIds),
        },
      );
    }

    const menus = await queryBuilder.orderBy('menu.sort', 'ASC').getMany();

    console.log(
      '🔍 后端查询到的菜单数据:',
      menus.map((m) => ({
        id: m.id,
        name: m.name,
        type: m.type,
        parent_id: m.parent?.id,
      })),
    );

    // 构建树形结构并去重
    const treeMenus = this.buildMenuTree(menus);

    console.log(
      '🌳 后端构建的菜单树:',
      treeMenus.map((m) => ({
        id: m.id,
        name: m.name,
        type: m.type,
        children_count: m.children?.length,
      })),
    );

    return treeMenus;
  }

  // 构建菜单树并去重
  private buildMenuTree(menus: Menu[]): Menu[] {
    const menuMap = new Map<number, Menu>();
    const rootMenus: Menu[] = [];

    // 创建菜单映射
    menus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    // 构建树形结构
    menus.forEach((menu) => {
      const menuNode = menuMap.get(menu.id);
      if (menuNode) {
        if (menu.parent) {
          const parent = menuMap.get(menu.parent.id);
          if (parent) {
            // 检查是否已经存在相同的子菜单（去重）
            const existingChild = parent.children.find(
              (child) => child.id === menu.id,
            );
            if (!existingChild) {
              parent.children.push(menuNode);
            }
          }
        } else {
          rootMenus.push(menuNode);
        }
      }
    });

    // 按sort排序
    const sortMenus = (menuList: Menu[]) => {
      menuList.sort((a, b) => a.sort - b.sort);
      menuList.forEach((menu) => {
        if (menu.children && menu.children.length > 0) {
          sortMenus(menu.children);
        }
      });
    };
    sortMenus(rootMenus);

    return rootMenus;
  }

  // 获取用户菜单权限（兼容旧版本）
  async getUserMenus(userPermissions: string[]): Promise<Menu[]> {
    const queryBuilder = this.menuRepository.createQueryBuilder('menu');

    // 只获取启用的菜单
    queryBuilder.where('menu.status = :status', { status: true });

    // 如果有权限限制，只返回有权限的菜单
    if (userPermissions && userPermissions.length > 0) {
      queryBuilder.andWhere(
        '(menu.permissionId IS NULL OR menu.permissionId IN (:...permissions))',
        {
          permissions: userPermissions,
        },
      );
    }

    const menus = await queryBuilder.orderBy('menu.sort', 'ASC').getMany();

    return this.buildMenuTree(menus);
  }

  // 获取用户按钮权限
  async getUserButtons(userId: number): Promise<string[]> {
    // 获取用户及其角色和权限
    const user = await this.adminRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 收集用户所有角色的权限ID（去重）
    const permissionIds = new Set<number>();
    user.roles.forEach((role) => {
      if (role.status === 1) {
        // 只考虑启用的角色
        role.permissions.forEach((permission) => {
          if (permission.status === 1) {
            // 只考虑启用的权限
            permissionIds.add(permission.id);
          }
        });
      }
    });

    // 查询按钮类型的菜单
    const queryBuilder = this.menuRepository
      .createQueryBuilder('menu')
      .where('menu.status = :status', { status: true })
      .andWhere('menu.type = :type', { type: 3 }) // 只查询按钮类型
      .andWhere('menu.buttonKey IS NOT NULL'); // 确保有按钮标识

    // 如果有权限限制，只返回有权限的按钮
    if (permissionIds.size > 0) {
      queryBuilder.andWhere(
        '(menu.permissionId IS NULL OR menu.permissionId IN (:...permissionIds))',
        {
          permissionIds: Array.from(permissionIds),
        },
      );
    }

    const buttons = await queryBuilder.select(['menu.buttonKey']).getMany();

    // 返回按钮标识列表
    return buttons
      .map((button) => button.buttonKey)
      .filter((key): key is string => key !== null);
  }

  // 批量删除菜单
  async batchDelete(ids: number[]): Promise<void> {
    for (const id of ids) {
      await this.delete(id);
    }
  }

  // 更新菜单状态
  async updateStatus(id: number, status: boolean): Promise<Menu> {
    const menu = await this.getMenuById(id);
    menu.status = status;
    return this.menuRepository.save(menu);
  }

  // 更新菜单排序
  async updateSort(id: number, sort: number): Promise<Menu> {
    const menu = await this.getMenuById(id);
    menu.sort = sort;
    return this.menuRepository.save(menu);
  }

  // 通过用户ID汇总完整用户档案（基础信息 + 角色 + 权限 + 菜单）
  async getFullUserProfile(userId: number): Promise<any> {
    // 查询用户及其角色、权限
    const user = await this.adminRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 组装角色与权限
    const roleInfo = (user.roles || []).map((role) => ({
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
    }));

    const roles = (user.roles || [])
      .filter((r) => r.status === 1)
      .map((r) => r.code);

    const permissionSet = new Set<string>();
    (user.roles || []).forEach((role) => {
      if (role.status === 1) {
        (role.permissions || []).forEach((permission) => {
          if (permission.status === 1 && permission.code) {
            permissionSet.add(permission.code);
          }
        });
      }
    });
    const permissions = Array.from(permissionSet);

    // 查询菜单树
    const menus = await this.getUserMenusByUserId(userId);

    // 返回完整用户档案
    return {
      id: user.id,
      username: user.username,
      realName: user.realName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      roles,
      permissions,
      roleInfo,
      menus,
    };
  }
}
