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
import { RoleMenu } from '../../../database/entities/role-menu.entity';

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
    orderNo?: number;
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
    externalLink?: string;
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
    queryParams?: Record<string, any>;
  };
  children?: RouteRecordStringComponent[];
}

@Injectable()
export class MenusService {
  // 将对外输出的菜单节点 status 规范为 0(启用)/1(禁用)，并保证 children 为数组
  private normalizeStatusForOutput<
    T extends { status?: any; children?: any[] },
  >(node: T): T {
    const raw = node?.status;
    let num: number;
    if (typeof raw === 'boolean') {
      num = raw ? 1 : 0;
    } else if (raw === null || raw === undefined || raw === '') {
      num = 0;
    } else {
      const n = Number(raw);
      num = Number.isNaN(n) ? 0 : n;
    }
    const normalized = { ...(node as any) };
    normalized.status = num === 1 ? 1 : 0;
    const children = Array.isArray(node?.children) ? node.children : [];
    normalized.children = children.map((c: any) =>
      this.normalizeStatusForOutput(c),
    );
    return normalized as T;
  }

  constructor(
    @InjectRepository(Menu)
    private menuRepository: TreeRepository<Menu>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(RoleMenu)
    private roleMenuRepository: Repository<RoleMenu>,
  ) {}

  // 创建菜单
  async create(createMenuDto: CreateMenuDto, currentUser?: any): Promise<Menu> {
    const { parentId, isHidden, isKeepAlive, permission, ...menuData } =
      createMenuDto;

    // 字段映射和转换
    const menu = this.menuRepository.create({
      ...menuData,
      title: menuData.name,
      orderNum: menuData.sort || menuData.orderNum || 0,
      status: menuData.status ? 1 : 0,
      hideInMenu: isHidden ? 1 : 0,
      keepAlive: isKeepAlive ? 1 : 0,
      ignoreAccess: 0,
      // 设置商户ID
      merchantId: currentUser?.merchantId || 1,
      // 根据菜单类型自动设置组件路径
      component: this.getComponentByMenuType(menuData.type, menuData.component),
      // 如果是按钮类型，优先使用permission作为buttonKey
      buttonKey: permission || menuData.buttonKey,
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

  // 根据菜单类型自动设置组件路径
  private getComponentByMenuType(
    type: MenuType,
    providedComponent?: string,
  ): string {
    switch (type) {
      case MenuType.DIRECTORY:
        // 目录类型自动设置为 BasicLayout
        return 'BasicLayout';
      case MenuType.MENU:
        // 菜单类型使用提供的组件路径，如果没有提供则为空
        return providedComponent || '';
      case MenuType.BUTTON:
        // 按钮类型不需要组件路径
        return '';
      default:
        return providedComponent || '';
    }
  }

  // 获取菜单树
  async getMenuTree(
    query: QueryMenuDto = {},
    currentUser?: any,
  ): Promise<Menu[]> {
    console.log('getMenuTree');
    const { name, type, status } = query;

    const queryBuilder = this.menuRepository.createQueryBuilder('menu');
    console.log('merchantId', currentUser);
    // 添加商户过滤条件
    if (currentUser && currentUser.merchantId) {
      queryBuilder.andWhere('menu.merchantId = :merchantId', {
        merchantId: currentUser.merchantId,
      });
    }

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

    // 获取所有符合条件的菜单（包括按钮）
    const menus = await queryBuilder.getMany();
    console.log('@@@@@@@', menus);
    // 为每个菜单添加对应的按钮权限（无论是否有类型过滤）
    const menusWithButtons = await this.addButtonsToMenus(menus);

    // 手动构建树形结构
    const tree = this.buildMenuTree(menus);

    // 对外输出前统一规范 status/children
    return tree.map((n) => this.normalizeStatusForOutput(n));
  }

  /**
   * 为菜单添加对应的按钮权限
   * 只从数据库读取，不自动生成
   */
  private async addButtonsToMenus(menus: Menu[]): Promise<Menu[]> {
    // 直接返回数据库中的菜单，不自动生成按钮
    return menus;
  }

  /**
   * 为菜单创建标准的CRUD按钮
   */
  private createStandardButtons(menu: Menu): Menu[] {
    const baseId = menu.id * 1000; // 使用菜单ID * 1000作为按钮ID基数
    const buttonConfigs = [
      { suffix: 1, name: '查看', key: 'view' },
      { suffix: 2, name: '新增', key: 'add' },
      { suffix: 3, name: '编辑', key: 'edit' },
      { suffix: 4, name: '删除', key: 'delete' },
    ];

    // 为角色管理添加特殊的分配权限按钮
    if (menu.name.includes('角色') || menu.buttonKey?.includes('role')) {
      buttonConfigs.push({ suffix: 5, name: '分配权限', key: 'permission' });
    }

    const buttons: Menu[] = buttonConfigs.map((config) => {
      const button = new Menu();
      button.id = baseId + config.suffix;
      button.name = `${menu.name}:${config.name}`;
      button.path = '';
      button.component = '';
      button.redirect = null;
      button.title = config.name;
      button.icon = null;
      button.activeIcon = null;
      button.orderNum = config.suffix;
      button.hideInMenu = 0;
      button.hideChildrenInMenu = 0;
      button.hideInBreadcrumb = 0;
      button.hideInTab = 0;
      button.keepAlive = 0;
      button.ignoreAccess = 0;
      button.affixTab = 0;
      button.affixTabOrder = 0;
      button.isExternal = 0;
      button.externalLink = null;
      button.iframeSrc = null;
      button.openInNewWindow = 0;
      button.badge = null;
      button.badgeType = 'normal';
      button.badgeVariants = 'default';
      button.authority = null;
      button.menuVisibleWithForbidden = 0;
      button.activePath = null;
      button.maxNumOfOpenTab = -1;
      button.fullPathKey = 1;
      button.noBasicLayout = 0;
      button.type = 3; // 按钮类型
      button.status = 1;
      button.parentId = menu.id;
      button.level = (menu.level || 1) + 1;
      button.pathIds = null;
      button.permissionId = null;
      button.buttonKey = `${menu.name.toLowerCase()}:${config.key}`;
      button.queryParams = null;
      button.createdBy = null;
      button.updatedBy = null;
      button.createdByName = null;
      button.updatedByName = null;
      button.children = [];
      button.permission = null;
      button.parent = null;
      button.permissions = [];
      button.roleMenus = [];
      button.createdAt = new Date();
      button.updatedAt = new Date();
      return button;
    });

    return buttons;
  }

  // 分页查询菜单
  async getMenus(query: QueryMenuDto, currentUser?: any): Promise<Menu[]> {
    const { name, type, status } = query;

    const queryBuilder = this.menuRepository.createQueryBuilder('menu');

    // 添加商户过滤条件
    if (currentUser && currentUser.merchantId) {
      queryBuilder.andWhere('menu.merchantId = :merchantId', {
        merchantId: currentUser.merchantId,
      });
    }

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
    // 扁平列表也做统一规范（children 归一为空数组）
    return data.map((n) =>
      this.normalizeStatusForOutput({ ...n, children: [] } as any),
    );
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
  async update(
    id: number,
    updateMenuDto: UpdateMenuDto,
    currentUser?: any,
  ): Promise<Menu> {
    const menu = await this.getMenuById(id);
    const { parentId, isHidden, isKeepAlive, permission, ...updateData } =
      updateMenuDto;

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
      // 根据菜单类型自动设置组件路径
      component: this.getComponentByMenuType(
        updateData.type || menu.type,
        updateData.component,
      ),
      // 自动更新更新者信息
      updatedBy: currentUser?.userId || menu.updatedBy,
      updatedByName: currentUser?.username || menu.updatedByName,
    };

    // 统一权限标识到 buttonKey（菜单/目录/按钮类型均支持）
    (mappedData as any).buttonKey =
      permission || updateData.buttonKey || (menu as any).buttonKey || null;

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

  // 根据用户ID获取菜单（基于角色-菜单直接关联）
  async getUserMenusByUserId(
    userId: number,
  ): Promise<RouteRecordStringComponent[]> {
    // 获取用户及其角色
    const user = await this.adminRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 收集用户所有启用角色的ID
    const userRoleIds = user.roles
      .filter((role) => role.status === 1)
      .map((role) => role.id);

    console.log('用户角色IDs:', userRoleIds);

    if (userRoleIds.length === 0) {
      console.log('用户没有启用的角色');
      return [];
    }

    // 通过角色-菜单关联表获取用户的菜单
    const roleMenus = await this.roleMenuRepository
      .createQueryBuilder('roleMenu')
      .leftJoinAndSelect('roleMenu.menu', 'menu')
      .where('roleMenu.roleId IN (:...roleIds)', { roleIds: userRoleIds })
      .andWhere('menu.status = :status', { status: 1 })
      .orderBy('menu.orderNum', 'ASC')
      .getMany();

    console.log('角色关联的菜单数量:', roleMenus.length);

    // 提取菜单并去重
    const menuMap = new Map<number, Menu>();
    roleMenus.forEach((roleMenu) => {
      if (roleMenu.menu) {
        menuMap.set(roleMenu.menu.id, roleMenu.menu);
      }
    });

    const userMenus = Array.from(menuMap.values());
    console.log('去重后的菜单数量:', userMenus.length);

    // 如果没有找到菜单，检查是否是超级管理员
    if (userMenus.length === 0) {
      const isSuperAdmin = user.roles.some(
        (role) => role.code === 'super_admin' && role.status === 1,
      );

      if (isSuperAdmin) {
        console.log('超级管理员但没有菜单关联，返回所有菜单');
        const allMenus = await this.menuRepository
          .createQueryBuilder('menu')
          .where('menu.status = :status', { status: 1 })
          .orderBy('menu.orderNum', 'ASC')
          .getMany();

        // 构建菜单树
        const menuTree = this.buildMenuTree(allMenus);
        return this.convertToRouteFormat(menuTree);
      }

      console.log('没有找到菜单');
      return [];
    }

    // 构建菜单树
    const menuTree = this.buildMenuTree(userMenus);

    // 转换为前端路由格式
    return this.convertToRouteFormat(menuTree);
  }

  // 构建菜单树结构
  private buildMenuTree(menus: Menu[]): Menu[] {
    const menuMap = new Map<number, Menu>();
    const rootMenus: Menu[] = [];

    // 创建菜单映射
    menus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    // 构建树结构
    menus.forEach((menu) => {
      const menuItem = menuMap.get(menu.id);
      if (menu.parentId && menuMap.has(menu.parentId)) {
        const parent = menuMap.get(menu.parentId);
        if (!parent.children) parent.children = [];
        parent.children.push(menuItem);
      } else {
        rootMenus.push(menuItem);
      }
    });

    return rootMenus;
  }

  // 转换为前端路由格式
  private convertToRouteFormat(menus: Menu[]): RouteRecordStringComponent[] {
    return menus.map((menu) => {
      const route: RouteRecordStringComponent = {
        name: menu.name,
        path: menu.path || '',
        component: menu.component || '',
        redirect: menu.redirect || undefined,
        meta: {
          title: menu.title,
          icon: menu.icon,
          activeIcon: menu.activeIcon,
          orderNo: menu.orderNum,
          hideInMenu: menu.hideInMenu === 1,
          hideChildrenInMenu: menu.hideChildrenInMenu === 1,
          hideInBreadcrumb: menu.hideInBreadcrumb === 1,
          hideInTab: menu.hideInTab === 1,
          keepAlive: menu.keepAlive === 1,
          ignoreAccess: menu.ignoreAccess === 1,
          affixTab: menu.affixTab === 1,
          affixTabOrder: menu.affixTabOrder,
          externalLink: menu.externalLink,
          iframeSrc: menu.iframeSrc,
          openInNewWindow: menu.openInNewWindow === 1,
          badge: menu.badge,
          badgeType: menu.badgeType,
          badgeVariants: menu.badgeVariants,
          authority: menu.authority,
          menuVisibleWithForbidden: menu.menuVisibleWithForbidden === 1,
          activePath: menu.activePath,
          maxNumOfOpenTab: menu.maxNumOfOpenTab,
          fullPathKey: menu.fullPathKey === 1,
          noBasicLayout: menu.noBasicLayout === 1,
          queryParams: menu.queryParams,
        },
      };

      // 递归处理子菜单
      if (menu.children && menu.children.length > 0) {
        route.children = this.convertToRouteFormat(menu.children);
      }

      return route;
    });
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

    // 收集用户所有角色的权限代码（去重）
    const permissionCodes = new Set<string>();
    user.roles.forEach((role) => {
      if (role.status === 1) {
        // 只考虑启用的角色
        role.permissions.forEach((permission) => {
          if (permission.status === 1 && permission.type === 'button') {
            // 只考虑启用的按钮权限
            permissionCodes.add(permission.code);
          }
        });
      }
    });

    return Array.from(permissionCodes);
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
    // 查询用户及其角色、商户信息
    const user = await this.adminRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'merchant'],
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

    // 从菜单的 button_key 提取权限标识
    const permissionSet = new Set<string>();

    // 获取用户所有启用角色的ID
    const userRoleIds = (user.roles || [])
      .filter((role) => role.status === 1)
      .map((role) => role.id);

    if (userRoleIds.length > 0) {
      // 通过角色-菜单关联表获取用户的所有菜单
      const roleMenus = await this.roleMenuRepository
        .createQueryBuilder('roleMenu')
        .leftJoinAndSelect('roleMenu.menu', 'menu')
        .leftJoinAndSelect('menu.permission', 'permission')
        .where('roleMenu.roleId IN (:...roleIds)', { roleIds: userRoleIds })
        .andWhere('menu.status = :status', { status: 1 })
        .getMany();

      // 提取所有菜单的权限标识（优先使用关联权限实体的 code，兼容 buttonKey）
      roleMenus.forEach((roleMenu) => {
        const menu = roleMenu.menu;
        if (menu) {
          const code = menu.buttonKey;
          if (code) {
            permissionSet.add(code);
          } else if (menu.buttonKey) {
            permissionSet.add(menu.buttonKey);
          }
        }
      });
    }

    const permissions = Array.from(permissionSet);

    // 查询基于权限过滤的菜单树
    const menus = await this.getUserMenusByUserId(userId);

    // 组装商户信息
    const merchant = user.merchant
      ? {
          id: user.merchant.id,
          merchantCode: user.merchant.merchantCode,
          merchantName: user.merchant.merchantName,
          merchantType: user.merchant.merchantType,
          status: user.merchant.status,
          logo: user.merchant.logo,
          description: user.merchant.description,
          certificationStatus: user.merchant.certificationStatus,
          maxProducts: user.merchant.maxProducts,
          maxAdmins: user.merchant.maxAdmins,
          maxStorage: user.merchant.maxStorage,
          createdAt: user.merchant.createdAt,
          updatedAt: user.merchant.updatedAt,
        }
      : null;

    // 返回完整用户档案
    return {
      id: user.id,
      username: user.username,
      realName: user.realName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      merchantId: user.merchantId,
      merchant,
      roles,
      permissions,
      roleInfo,
      menus,
    };
  }
}
