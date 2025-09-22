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
  private normalizeStatusForOutput<T extends { status?: any; children?: any[] }>(node: T): T {
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
    normalized.children = children.map((c: any) => this.normalizeStatusForOutput(c));
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
      // 根据菜单类型自动设置组件路径
      component: this.getComponentByMenuType(menuData.type, menuData.component),
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

  // 根据菜单类型自动设置组件路径
  private getComponentByMenuType(type: MenuType, providedComponent?: string): string {
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

    // 获取所有符合条件的菜单（包括按钮）
    const menus = await queryBuilder.getMany();

    // 为每个菜单添加对应的按钮权限（无论是否有类型过滤）
    const menusWithButtons = await this.addButtonsToMenus(menus);
    
    // 手动构建树形结构
    const tree = this.buildMenuTree(menusWithButtons);
    
    // 对外输出前统一规范 status/children
    return tree.map((n) => this.normalizeStatusForOutput(n));
  }

  /**
   * 为菜单添加对应的按钮权限
   */
  private async addButtonsToMenus(menus: Menu[]): Promise<Menu[]> {
    const result = [...menus];
    
    // 为每个菜单类型的项目添加标准的按钮权限
    const menuItems = menus.filter(menu => menu.type === 2); // 菜单类型
    
    for (const menu of menuItems) {
      // 检查是否已经有对应的按钮，如果没有则创建标准按钮
      const existingButtons = menus.filter(m => m.parentId === menu.id && m.type === 3);
      
      if (existingButtons.length === 0) {
        // 创建标准的CRUD按钮
        const buttons = this.createStandardButtons(menu);
        result.push(...buttons);
      }
    }
    
    return result;
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

    const buttons: Menu[] = buttonConfigs.map(config => {
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
    // 扁平列表也做统一规范（children 归一为空数组）
    return data.map((n) => this.normalizeStatusForOutput({ ...n, children: [] } as any));
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
      // 根据菜单类型自动设置组件路径
      component: this.getComponentByMenuType(
        updateData.type || menu.type,
        updateData.component
      ),
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
      .filter(role => role.status === 1)
      .map(role => role.id);

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
    roleMenus.forEach(roleMenu => {
      if (roleMenu.menu) {
        menuMap.set(roleMenu.menu.id, roleMenu.menu);
      }
    });

    const userMenus = Array.from(menuMap.values());
    console.log('去重后的菜单数量:', userMenus.length);

    // 如果没有找到菜单，检查是否是超级管理员
    if (userMenus.length === 0) {
      const isSuperAdmin = user.roles.some(role => role.code === 'super_admin' && role.status === 1);
      
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

  // 创建默认菜单结构（基于用户权限代码）
  private createDefaultMenus(permissionCodes: string[]): Menu[] {
    const defaultMenus: Menu[] = [];
    let menuId = 1000; // 使用较大的ID避免冲突

    // 系统管理目录
    if (permissionCodes.some(code => code.startsWith('system'))) {
      const systemMenu: Menu = {
        id: menuId++,
        name: 'system',
        path: '/system',
        component: 'BasicLayout',
        redirect: null,
        title: '系统管理',
        icon: 'ion:settings-outline',
        activeIcon: null,
        orderNum: 1,
        hideInMenu: 0,
        hideChildrenInMenu: 0,
        hideInBreadcrumb: 0,
        hideInTab: 0,
        keepAlive: 0,
        ignoreAccess: 0,
        affixTab: 0,
        affixTabOrder: 0,
        isExternal: 0,
        externalLink: null,
        iframeSrc: null,
        openInNewWindow: 0,
        badge: null,
        badgeType: 'normal',
        badgeVariants: 'default',
        authority: null,
        menuVisibleWithForbidden: 0,
        activePath: null,
        maxNumOfOpenTab: -1,
        fullPathKey: 1,
        noBasicLayout: 0,
        type: 1, // 目录
        status: 1,
        parentId: null,
        level: 1,
        pathIds: null,
        permissionId: null,
        buttonKey: null,
        queryParams: null,
        createdBy: null,
        updatedBy: null,
        createdByName: null,
        updatedByName: null,
        children: [],
        permission: null,
        permissions: [],
        parent: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Menu;
      
      defaultMenus.push(systemMenu);

      // 菜单管理
      if (permissionCodes.includes('system:menu')) {
        defaultMenus.push({
          ...systemMenu,
          id: menuId++,
          name: 'system-menu',
          path: '/system/menu',
          component: '/system/menu/index',
          title: '菜单管理',
          icon: 'ion:menu-outline',
          orderNum: 1,
          type: 2, // 菜单
          parentId: systemMenu.id,
          level: 2,
        } as Menu);
      }

      // 角色管理
      if (permissionCodes.includes('system:role')) {
        defaultMenus.push({
          ...systemMenu,
          id: menuId++,
          name: 'system-role',
          path: '/system/role',
          component: '/system/role/index',
          title: '角色管理',
          icon: 'ion:key-outline',
          orderNum: 2,
          type: 2, // 菜单
          parentId: systemMenu.id,
          level: 2,
        } as Menu);
      }

      // 用户管理
      if (permissionCodes.includes('system:user')) {
        defaultMenus.push({
          ...systemMenu,
          id: menuId++,
          name: 'system-user',
          path: '/system/user',
          component: '/system/user/index',
          title: '用户管理',
          icon: 'ion:people-outline',
          orderNum: 3,
          type: 2, // 菜单
          parentId: systemMenu.id,
          level: 2,
        } as Menu);
      }
    }

    // 商品管理目录
    if (permissionCodes.some(code => code.startsWith('product'))) {
      const productMenu: Menu = {
        id: menuId++,
        name: 'product',
        path: '/product',
        component: 'BasicLayout',
        redirect: null,
        title: '商品管理',
        icon: 'ion:cube-outline',
        activeIcon: null,
        orderNum: 2,
        hideInMenu: 0,
        hideChildrenInMenu: 0,
        hideInBreadcrumb: 0,
        hideInTab: 0,
        keepAlive: 0,
        ignoreAccess: 0,
        affixTab: 0,
        affixTabOrder: 0,
        isExternal: 0,
        externalLink: null,
        iframeSrc: null,
        openInNewWindow: 0,
        badge: null,
        badgeType: 'normal',
        badgeVariants: 'default',
        authority: null,
        menuVisibleWithForbidden: 0,
        activePath: null,
        maxNumOfOpenTab: -1,
        fullPathKey: 1,
        noBasicLayout: 0,
        type: 1, // 目录
        status: 1,
        parentId: null,
        level: 1,
        pathIds: null,
        permissionId: null,
        buttonKey: null,
        queryParams: null,
        createdBy: null,
        updatedBy: null,
        createdByName: null,
        updatedByName: null,
        children: [],
        permission: null,
        permissions: [],
        parent: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Menu;
      
      defaultMenus.push(productMenu);

      // 商品列表
      if (permissionCodes.includes('product:list')) {
        defaultMenus.push({
          ...productMenu,
          id: menuId++,
          name: 'product-list',
          path: '/product/list',
          component: '/product/list/index',
          title: '商品列表',
          icon: 'ion:list-outline',
          orderNum: 1,
          type: 2, // 菜单
          parentId: productMenu.id,
          level: 2,
        } as Menu);
      }
    }

    // 订单管理目录
    if (permissionCodes.some(code => code.startsWith('order'))) {
      const orderMenu: Menu = {
        id: menuId++,
        name: 'order',
        path: '/order',
        component: 'BasicLayout',
        redirect: null,
        title: '订单管理',
        icon: 'ion:receipt-outline',
        activeIcon: null,
        orderNum: 3,
        hideInMenu: 0,
        hideChildrenInMenu: 0,
        hideInBreadcrumb: 0,
        hideInTab: 0,
        keepAlive: 0,
        ignoreAccess: 0,
        affixTab: 0,
        affixTabOrder: 0,
        isExternal: 0,
        externalLink: null,
        iframeSrc: null,
        openInNewWindow: 0,
        badge: null,
        badgeType: 'normal',
        badgeVariants: 'default',
        authority: null,
        menuVisibleWithForbidden: 0,
        activePath: null,
        maxNumOfOpenTab: -1,
        fullPathKey: 1,
        noBasicLayout: 0,
        type: 1, // 目录
        status: 1,
        parentId: null,
        level: 1,
        pathIds: null,
        permissionId: null,
        buttonKey: null,
        queryParams: null,
        createdBy: null,
        updatedBy: null,
        createdByName: null,
        updatedByName: null,
        children: [],
        permission: null,
        permissions: [],
        parent: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Menu;
      
      defaultMenus.push(orderMenu);

      // 订单列表
      if (permissionCodes.includes('order:list')) {
        defaultMenus.push({
          ...orderMenu,
          id: menuId++,
          name: 'order-list',
          path: '/order/list',
          component: '/order/list/index',
          title: '订单列表',
          icon: 'ion:list-outline',
          orderNum: 1,
          type: 2, // 菜单
          parentId: orderMenu.id,
          level: 2,
        } as Menu);
      }
    }

    console.log('创建的默认菜单:', defaultMenus.map(m => ({ id: m.id, name: m.name, title: m.title, type: m.type, parentId: m.parentId })));
    return defaultMenus;
  }

  // 基于权限构建菜单树结构
  private buildMenuTreeFromPermissions(permissions: any[]): any[] {
    const permissionMap = new Map<number, any>();
    const rootPermissions: any[] = [];

    // 创建权限映射并添加children属性
    permissions.forEach(permission => {
      permissionMap.set(permission.id, { ...permission, children: [] });
    });

    // 构建树结构
    permissions.forEach(permission => {
      const permissionItem = permissionMap.get(permission.id);
      if (permission.parentId && permissionMap.has(permission.parentId)) {
        const parent = permissionMap.get(permission.parentId);
        parent.children.push(permissionItem);
      } else {
        rootPermissions.push(permissionItem);
      }
    });

    return rootPermissions;
  }



  // 生成默认路径
  private generateDefaultPath(code: string): string {
    return `/${code.replace(':', '/')}`;
  }

  // 根据权限类型生成默认组件
  private generateDefaultComponent(code: string, type: number): string {
    // type: 1-目录，2-菜单，3-按钮
    if (type === 1) {
      return 'BasicLayout'; // 目录类型使用 BasicLayout
    } else if (type === 2) {
      return `${code.replace(':', '/')}/index`; // 菜单类型使用具体组件路径
    } else {
      return ''; // 按钮类型不需要组件
    }
  }

  // 获取默认图标
  private getDefaultIcon(code: string): string {
    const iconMap = {
      'system': 'ion:settings-outline',
      'system:menu': 'ion:menu-outline',
      'system:role': 'ion:key-outline',
      'system:user': 'ion:people-outline',
      'product': 'ion:cube-outline',
      'product:list': 'ion:list-outline',
      'order': 'ion:receipt-outline',
      'order:list': 'ion:list-outline',
      'media': 'ion:folder-open',
      'media:static': 'ion:image',
    };
    
    return iconMap[code] || 'ion:document-outline';
  }

  // 获取默认权限
  private getDefaultAuthority(): string[] {
    return ['admin', 'super_admin'];
  }

  // 根据权限代码获取排序号
  private getOrderByPermissionCode(code: string): number {
    const orderMap = {
      'system': 1,
      'system:user': 1,
      'system:role': 2,
      'system:menu': 3,
      'product': 2,
      'product:list': 1,
      'order': 3,
      'order:list': 1
    };

    return orderMap[code] || 99;
  }

  // 构建菜单树结构
  private buildMenuTree(menus: Menu[]): Menu[] {
    const menuMap = new Map<number, Menu>();
    const rootMenus: Menu[] = [];

    // 创建菜单映射
    menus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    // 构建树结构
    menus.forEach(menu => {
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
    return menus.map(menu => {
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

    // 查询基于权限过滤的菜单树
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