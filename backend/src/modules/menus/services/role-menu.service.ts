import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleMenu } from '../../../database/entities/role-menu.entity';
import { Role } from '../../../database/entities/role.entity';
import { Menu } from '../entities/menu.entity';

@Injectable()
export class RoleMenuService {
  constructor(
    @InjectRepository(RoleMenu)
    private roleMenuRepository: Repository<RoleMenu>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  /**
   * 为角色分配菜单权限
   * @param roleId 角色ID
   * @param menuIds 菜单ID数组
   */
  async assignMenusToRole(roleId: number, menuIds: number[]): Promise<void> {
    // 验证角色是否存在
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 验证菜单是否存在
    const menus = await this.menuRepository.findByIds(menuIds);
    if (menus.length !== menuIds.length) {
      throw new NotFoundException('部分菜单不存在');
    }

    // 删除该角色现有的菜单关联
    await this.roleMenuRepository.delete({ roleId });

    // 创建新的菜单关联
    const roleMenus = menuIds.map(menuId => ({
      roleId,
      menuId,
    }));

    if (roleMenus.length > 0) {
      await this.roleMenuRepository.save(roleMenus);
    }
  }

  /**
   * 获取角色的菜单权限
   * @param roleId 角色ID
   */
  async getRoleMenus(roleId: number): Promise<Menu[]> {
    const roleMenus = await this.roleMenuRepository
      .createQueryBuilder('roleMenu')
      .leftJoinAndSelect('roleMenu.menu', 'menu')
      .where('roleMenu.roleId = :roleId', { roleId })
      .andWhere('menu.status = :status', { status: 1 })
      .orderBy('menu.orderNum', 'ASC')
      .getMany();

    return roleMenus.map(roleMenu => roleMenu.menu);
  }

  /**
   * 获取角色的菜单ID列表
   * @param roleId 角色ID
   */
  async getRoleMenuIds(roleId: number): Promise<number[]> {
    const roleMenus = await this.roleMenuRepository.find({
      where: { roleId },
      select: ['menuId'],
    });

    return roleMenus.map(roleMenu => roleMenu.menuId);
  }

  /**
   * 移除角色的菜单权限
   * @param roleId 角色ID
   * @param menuIds 要移除的菜单ID数组
   */
  async removeMenusFromRole(roleId: number, menuIds: number[]): Promise<void> {
    await this.roleMenuRepository.delete({
      roleId,
      menuId: menuIds.length === 1 ? menuIds[0] : undefined,
    });

    if (menuIds.length > 1) {
      for (const menuId of menuIds) {
        await this.roleMenuRepository.delete({ roleId, menuId });
      }
    }
  }

  /**
   * 获取菜单被哪些角色使用
   * @param menuId 菜单ID
   */
  async getMenuRoles(menuId: number): Promise<Role[]> {
    const roleMenus = await this.roleMenuRepository
      .createQueryBuilder('roleMenu')
      .leftJoinAndSelect('roleMenu.role', 'role')
      .where('roleMenu.menuId = :menuId', { menuId })
      .andWhere('role.status = :status', { status: 1 })
      .getMany();

    return roleMenus.map(roleMenu => roleMenu.role);
  }

  /**
   * 批量为多个角色分配相同的菜单
   * @param roleIds 角色ID数组
   * @param menuIds 菜单ID数组
   */
  async assignMenusToMultipleRoles(roleIds: number[], menuIds: number[]): Promise<void> {
    // 验证角色是否存在
    const roles = await this.roleRepository.findByIds(roleIds);
    if (roles.length !== roleIds.length) {
      throw new NotFoundException('部分角色不存在');
    }

    // 验证菜单是否存在
    const menus = await this.menuRepository.findByIds(menuIds);
    if (menus.length !== menuIds.length) {
      throw new NotFoundException('部分菜单不存在');
    }

    // 为每个角色分配菜单
    for (const roleId of roleIds) {
      await this.assignMenusToRole(roleId, menuIds);
    }
  }

  /**
   * 复制角色的菜单权限到另一个角色
   * @param fromRoleId 源角色ID
   * @param toRoleId 目标角色ID
   */
  async copyRoleMenus(fromRoleId: number, toRoleId: number): Promise<void> {
    // 获取源角色的菜单ID
    const sourceMenuIds = await this.getRoleMenuIds(fromRoleId);
    
    if (sourceMenuIds.length > 0) {
      // 分配给目标角色
      await this.assignMenusToRole(toRoleId, sourceMenuIds);
    }
  }

  /**
   * 获取所有角色的菜单分配情况
   */
  async getAllRoleMenuAssignments(): Promise<Array<{ role: Role; menus: Menu[] }>> {
    const roles = await this.roleRepository.find({ where: { status: 1 } });
    const result = [];

    for (const role of roles) {
      const menus = await this.getRoleMenus(role.id);
      result.push({ role, menus });
    }

    return result;
  }
}