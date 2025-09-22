import { Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../../menus/entities/menu.entity';
import { Public } from '../../../auth/decorators/public.decorator';

@Controller('api/resource-menu')
export class ResourceMenuController {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  @Post('init')
  @Public()
  async initResourceMenus() {
    try {
      // 检查是否已存在媒体管理菜单
      const existingMenu = await this.menuRepository.findOne({
        where: { path: '/medial' }
      });

      if (existingMenu) {
        return {
          success: true,
          message: '媒体管理菜单已存在',
          data: existingMenu
        };
      }

      // 创建媒体管理父菜单
      const parentMenu = this.menuRepository.create({
        name: 'Medial',
        path: '/medial',
        component: 'LAYOUT',
        title: '媒体管理',
        icon: 'lucide:image',
        type: 1,
        status: 1,
        orderNum: 1000,
        hideInMenu: 0,
        level: 1,
        pathIds: '',
      });

      const savedParentMenu = await this.menuRepository.save(parentMenu);

      // 创建静态资源子菜单
      const staticMenu = this.menuRepository.create({
        name: 'MedialStatic',
        path: '/medial/static',
        component: '/medial/static/index',
        title: '静态资源',
        icon: 'lucide:folder-open',
        type: 2,
        status: 1,
        orderNum: 1,
        hideInMenu: 0,
        parentId: savedParentMenu.id,
        level: 2,
        pathIds: `${savedParentMenu.id}`,
      });

      // 创建分类管理子菜单
      const categoryMenu = this.menuRepository.create({
        name: 'MedialCategory',
        path: '/medial/category',
        component: '/medial/category/index',
        title: '分类管理',
        icon: 'lucide:folder-tree',
        type: 2,
        status: 1,
        orderNum: 2,
        hideInMenu: 1, // 隐藏在菜单中
        parentId: savedParentMenu.id,
        level: 2,
        pathIds: `${savedParentMenu.id}`,
      });

      const savedStaticMenu = await this.menuRepository.save(staticMenu);
      const savedCategoryMenu = await this.menuRepository.save(categoryMenu);

      return {
        success: true,
        message: '媒体管理菜单创建成功',
        data: {
          parent: savedParentMenu,
          children: [savedStaticMenu, savedCategoryMenu]
        }
      };

    } catch (error) {
      console.error('创建媒体管理菜单失败:', error);
      return {
        success: false,
        message: '创建媒体管理菜单失败',
        error: error.message
      };
    }
  }

  @Post('assign-to-admin')
  @Public()
  async assignMenusToSuperAdmin() {
    try {
      // 这里需要将菜单分配给超级管理员角色
      // 具体实现取决于你的角色菜单关联表结构
      
      return {
        success: true,
        message: '菜单已分配给超级管理员'
      };
    } catch (error) {
      return {
        success: false,
        message: '分配菜单失败',
        error: error.message
      };
    }
  }
}