// 菜单树形结构测试工具
export interface TestMenuData {
  id: number;
  name: string;
  path: string;
  component: string;
  type: number;
  status: boolean;
  parentId?: number;
  orderNum: number;
  children?: TestMenuData[];
  hasChildren?: boolean;
}

// 测试数据
export const mockMenuData: TestMenuData[] = [
  {
    id: 1,
    name: '系统管理',
    path: '/system',
    component: '',
    type: 1, // 目录
    status: true,
    parentId: 0,
    orderNum: 1
  },
  {
    id: 2,
    name: '菜单管理',
    path: '/system/menu',
    component: '/system/menu/index',
    type: 2, // 菜单
    status: true,
    parentId: 1,
    orderNum: 1
  },
  {
    id: 3,
    name: '用户管理',
    path: '/system/user',
    component: '/system/user/index',
    type: 2, // 菜单
    status: true,
    parentId: 1,
    orderNum: 2
  },
  {
    id: 4,
    name: '新增按钮',
    path: '',
    component: '',
    type: 3, // 按钮
    status: true,
    parentId: 2,
    orderNum: 1
  },
  {
    id: 5,
    name: '商城管理',
    path: '/mall',
    component: '',
    type: 1, // 目录
    status: true,
    parentId: 0,
    orderNum: 2
  },
  {
    id: 6,
    name: '商品管理',
    path: '/mall/product',
    component: '/mall/product/index',
    type: 2, // 菜单
    status: true,
    parentId: 5,
    orderNum: 1
  }
];

// 构建树形结构的函数
export function buildTreeFromFlatData(flatData: TestMenuData[]): TestMenuData[] {
  const menuMap = new Map<number, TestMenuData>();
  const rootMenus: TestMenuData[] = [];

  // 创建菜单映射
  flatData.forEach(menu => {
    const menuNode = { 
      ...menu, 
      children: [],
      hasChildren: false
    };
    menuMap.set(menu.id, menuNode);
  });

  // 构建树形结构
  flatData.forEach(menu => {
    const menuNode = menuMap.get(menu.id);
    if (menuNode) {
      if (menu.parentId && menu.parentId !== 0) {
        const parent = menuMap.get(menu.parentId);
        if (parent && parent.children) {
          parent.children.push(menuNode);
          parent.hasChildren = true;
        }
      } else {
        rootMenus.push(menuNode);
      }
    }
  });

  // 按orderNum排序
  const sortMenus = (menuList: TestMenuData[]) => {
    menuList.sort((a, b) => a.orderNum - b.orderNum);
    menuList.forEach(menu => {
      if (menu.children && menu.children.length > 0) {
        menu.hasChildren = true;
        sortMenus(menu.children);
      }
    });
  };
  sortMenus(rootMenus);

  return rootMenus;
}

// 测试函数
export function testMenuTree() {
  console.log('原始平面数据:', mockMenuData);
  
  const treeData = buildTreeFromFlatData(mockMenuData);
  console.log('构建的树形数据:', JSON.stringify(treeData, null, 2));
  
  // 验证树形结构
  const validateTree = (nodes: TestMenuData[], level = 1) => {
    nodes.forEach(node => {
      console.log(`${'  '.repeat(level)}${node.name} (ID: ${node.id}, Type: ${node.type}, HasChildren: ${node.hasChildren})`);
      if (node.children && node.children.length > 0) {
        validateTree(node.children, level + 1);
      }
    });
  };
  
  console.log('树形结构验证:');
  validateTree(treeData);
  
  return treeData;
}