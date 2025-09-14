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

// 添加缺失的类型定义 - 导出接口供控制器使用
export interface RouteRecordStringComponent {
  name: string;
  path: string;
  component: string;
  redirect?: string;
  meta?: {
    // 基础显示
    title: string;
    icon?: string;
    activeIcon?: string;
    order?: number;
    // 显示控制
    hideInMenu?: boolean;
    hideChildrenInMenu?: boolean;
    hideInBreadcrumb?: boolean;
    hideInTab?: boolean;
    // 功能控制
    keepAlive?: boolean;
    ignoreAccess?: boolean;
    affixTab?: boolean;
    affixTabOrder?: number;
    // 外链和iframe
    link?: string;
    iframeSrc?: string;
    openInNewWindow?: boolean;
    // 徽标配置
    badge?: string;
    badgeType?: 'dot' | 'normal';
    badgeVariants?: string;
    // 权限控制
    authority?: string[];
    menuVisibleWithForbidden?: boolean;
    activePath?: string;
    // 标签页控制
    maxNumOfOpenTab?: number;
    fullPathKey?: boolean;
    // 布局控制
    noBasicLayout?: boolean;
    // 查询参数
    query?: Record<string, any>;
    // 其他属性
    loaded?: boolean;
  };
  children?: RouteRecordStringComponent[];
}

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
  async create(createMenuDto: CreateMenuDto, currentUser?: any): Promise<Menu> {
    const {
      parentId,
      isHidden,
      isKeepAlive,
      permission,
      ...menuData
    } = createMenuDto;

    // 字段映射和转换
    const menu = this.menuRepository.create({
      ...menuData,
      title: menuData.name,
      orderNum: menuData.sort || menuData.orderNum || 0,
      status: menuData.status ? 1 : 0,
      hideInMenu: isHidden ? 1 : 0,
      keepAlive: isKeepAlive ? 1 : 0,
      ignoreAccess: 0,
      // 如果是按钮类型，优先使用permission作为buttonKey
      buttonKey:
        menuData.type === MenuType.BUTTON
          ? permission || menuData.buttonKey
          : menuData.buttonKey,
      // 自动填入创建者信息
      createdBy: currentUser?.userId || null,
      createdByName: currentUser?.username || null,
      updatedBy: currentUser?.userId || null,
      updatedByName: currentUser?.username || null,
    });

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
      if (menu.type !== MenuType.DIRECTORY) {
        throw new BadRequestException('根级菜单只能是目录类型');
      }
    }

    // 验证按钮类型必须有buttonKey或permission
    if (menu.type === MenuType.BUTTON && !menu.buttonKey && !permission) {
      throw new BadRequestException('按钮类型菜单必须设置权限标识');
    }

    return await this.menuRepository.save(menu);
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
    const { name, type, status } = query;

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

    queryBuilder.orderBy('menu.orderNum', 'ASC');

    // 获取所有符合条件的菜单
    const menus = await queryBuilder.getMany();

    // 手动构建树形结构
    return this.buildMenuTree(menus);
  }

  // 分页查询菜单
  async getMenus(query: QueryMenuDto): Promise<Menu[]> {
    const { name, type, status } = query;

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

    const data = await queryBuilder.orderBy('menu.orderNum', 'ASC').getMany();

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
  async update(id: number, updateMenuDto: UpdateMenuDto, currentUser?: any): Promise<Menu> {
    const menu = await this.getMenuById(id);
    const {
      parentId,
      isHidden,
      isKeepAlive,
      permission,
      ...updateData
    } = updateMenuDto;

    // 检查是否将菜单设置为自己的子菜单
    if (parentId === id) {
      throw new BadRequestException('不能将菜单设置为自己的子菜单');
    }

    // 字段映射和转换
    const mappedData = {
      ...updateData,
      title: updateData.name || menu.title,
      orderNum: updateData.sort || updateData.orderNum || menu.orderNum,
      status:
        updateData.status !== undefined
          ? updateData.status
            ? 1
            : 0
          : menu.status,
      hideInMenu: isHidden !== undefined ? (isHidden ? 1 : 0) : menu.hideInMenu,
      keepAlive:
        isKeepAlive !== undefined ? (isKeepAlive ? 1 : 0) : menu.keepAlive,
      // 自动更新更新者信息
      updatedBy: currentUser?.userId || menu.updatedBy,
      updatedByName: currentUser?.username || menu.updatedByName,
    };

      // 如果是按钮类型，处理buttonKey
    if (updateData.type === MenuType.BUTTON || menu.type === MenuType.BUTTON) {
      (mappedData as any).buttonKey =
        permission || updateData.buttonKey || menu.buttonKey;
    }

    // 如果有父级菜单，设置父级关系
    if (parentId !== undefined) {
      if (parentId === 0 || parentId === null) {
        menu.parent = null;
        // 根级菜单只能是目录类型
        if (mappedData.type && mappedData.type !== MenuType.DIRECTORY) {
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
        this.validateMenuHierarchy(parent, mappedData.type || menu.type);
        menu.parent = parent;
      }
    }

    // 验证按钮类型必须有buttonKey或permission
    if (
      (mappedData.type === MenuType.BUTTON || menu.type === MenuType.BUTTON) &&
      !(mappedData as any).buttonKey &&
      !permission
    ) {
      throw new BadRequestException('按钮类型菜单必须设置权限标识');
    }

    Object.assign(menu, mappedData);
    return await this.menuRepository.save(menu);
  }

  // 删除菜单
  async delete(id: number): Promise<void> {
    const menu = await this.getMenuById(id);

    // 检查是否有子菜单
    const children = await this.menuRepository.find({
      where: { parentId: id },
    });
    if (children.length > 0) {
      throw new BadRequestException('请先删除子菜单');
    }

    await this.menuRepository.remove(menu);
  }

  // 根据用户ID获取菜单（支持多角色，自动去重）
  async getUserMenusByUserId(
    userId: number,
  ): Promise<RouteRecordStringComponent[]> {
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

    // 查询菜单（只包含目录和菜单类型，排除按钮）
    const queryBuilder = this.menuRepository
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.permission', 'permission')
      .leftJoinAndSelect('menu.parent', 'parent')
      .where('menu.status = :status', { status: true })
      .andWhere('menu.hideInMenu = :hideInMenu', { hideInMenu: 0 })
      .andWhere('menu.type IN (:...types)', { types: [1, 2] }); // 只获取目录和菜单

    // 如果有权限限制，只返回有权限的菜单
    if (permissionIds.size > 0) {
      queryBuilder.andWhere(
        '(menu.permissionId IS NULL OR menu.permissionId IN (:...permissionIds))',
        {
          permissionIds: Array.from(permissionIds),
        },
      );
    }

    const menus = await queryBuilder.orderBy('menu.orderNum', 'ASC').getMany();
    const menuTree = this.buildMenuTree(menus);

    // 转换为前端需要的格式
    return this.convertToRouteFormat(menuTree);
  }

  private convertToRouteFormat(menus: Menu[]): RouteRecordStringComponent[] {
    return menus.map((menu) => {
      const route: RouteRecordStringComponent = {
        name: menu.name,
        path: menu.path,
        component: menu.component || (menu.type === 1 ? 'BasicLayout' : ''),
        redirect: menu.redirect,
        meta: {
          title: menu.title || menu.name,
          icon: menu.icon,
          activeIcon: menu.activeIcon,
          order: menu.orderNum || 0,
          hideInMenu: (menu.hideInMenu || 0) === 1,
          hideChildrenInMenu: (menu.hideChildrenInMenu || 0) === 1,
          hideInBreadcrumb: (menu.hideInBreadcrumb || 0) === 1,
          hideInTab: (menu.hideInTab || 0) === 1,
          keepAlive: (menu.keepAlive || 0) === 1,
          ignoreAccess: (menu.ignoreAccess || 0) === 1,
          affixTab: (menu.affixTab || 0) === 1,
          affixTabOrder: menu.affixTabOrder || 0,
          link: menu.externalLink,
          iframeSrc: menu.iframeSrc,
          openInNewWindow: (menu.openInNewWindow || 0) === 1,
          badge: menu.badge,
          badgeType: menu.badgeType || 'normal',
          badgeVariants: menu.badgeVariants || 'default',
          authority: menu.authority || [],
          menuVisibleWithForbidden: (menu.menuVisibleWithForbidden || 0) === 1,
          activePath: menu.activePath,
          maxNumOfOpenTab: menu.maxNumOfOpenTab || -1,
          fullPathKey: (menu.fullPathKey || 1) === 1,
          noBasicLayout: (menu.noBasicLayout || 0) === 1,
          query: menu.queryParams,
        },
      };

      if (menu.children && menu.children.length > 0) {
        route.children = this.convertToRouteFormat(menu.children);
      }

      return route;
    });
  }

  // 构建菜单树并去重
  private buildMenuTree(menus: Menu[]): Menu[] {
    const menuMap = new Map<number, Menu>();
    const rootMenus: Menu[] = [];

    // 创建菜单映射，转换数据格式
    menus.forEach((menu) => {
      const transformedMenu: Menu = {
        ...menu,
        children: [],
      };
      menuMap.set(menu.id, transformedMenu);
    });

    // 构建树形结构
    menus.forEach((menu) => {
      const menuNode = menuMap.get(menu.id);
      if (menuNode) {
        // 检查是否有父级菜单（通过parentId判断）
        if (menu.parentId && menu.parentId > 0) {
          const parent = menuMap.get(menu.parentId);
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
          // 没有父级ID或parentId为0的是根菜单
          rootMenus.push(menuNode);
        }
      }
    });

    // 按orderNum排序
    const sortMenus = (menuList: Menu[]) => {
      menuList.sort((a, b) => (a.orderNum || 0) - (b.orderNum || 0));
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

    const menus = await queryBuilder.orderBy('menu.orderNum', 'ASC').getMany();

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
    menu.status = status ? 1 : 0;
    return await this.menuRepository.save(menu);
  }

  // 更新菜单排序
  async updateSort(id: number, sort: number): Promise<Menu> {
    const menu = await this.getMenuById(id);
    menu.orderNum = sort;
    return await this.menuRepository.save(menu);
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
