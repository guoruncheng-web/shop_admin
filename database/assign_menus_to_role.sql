-- ========================================
-- 将商户ID=9的菜单赋予角色code=SUPER_ADMIN_URQA9FK1
-- ========================================

-- 角色ID: 12
-- 商户ID: 9

-- 删除该角色的旧菜单关联（如果存在）
DELETE FROM role_menus WHERE role_id = 12;

-- 将商户9的所有菜单关联到角色12
INSERT INTO role_menus (role_id, menu_id, created_at, updated_at)
SELECT
  12 as role_id,
  id as menu_id,
  NOW() as created_at,
  NOW() as updated_at
FROM menus
WHERE merchant_id = 9
ORDER BY id;

-- 验证结果
SELECT '=== 角色菜单关联统计 ===' as info;

SELECT
  r.id as '角色ID',
  r.code as '角色代码',
  r.name as '角色名称',
  r.merchant_id as '商户ID',
  COUNT(rm.id) as '关联菜单数'
FROM roles r
LEFT JOIN role_menus rm ON r.id = rm.role_id
WHERE r.id = 12
GROUP BY r.id, r.code, r.name, r.merchant_id;

SELECT '=== 关联的菜单类型分布 ===' as info;

SELECT
  m.type as '菜单类型',
  CASE
    WHEN m.type = 1 THEN '目录'
    WHEN m.type = 2 THEN '菜单'
    WHEN m.type = 3 THEN '按钮'
  END as '类型说明',
  COUNT(*) as '数量'
FROM role_menus rm
JOIN menus m ON rm.menu_id = m.id
WHERE rm.role_id = 12
GROUP BY m.type
ORDER BY m.type;

SELECT '=== 顶级菜单列表 ===' as info;

SELECT
  m.id as '菜单ID',
  m.name as '菜单名称',
  m.title as '菜单标题',
  m.type as '类型',
  CASE
    WHEN m.type = 1 THEN '目录'
    WHEN m.type = 2 THEN '菜单'
    WHEN m.type = 3 THEN '按钮'
  END as '类型说明'
FROM role_menus rm
JOIN menus m ON rm.menu_id = m.id
WHERE rm.role_id = 12
  AND m.parent_id IS NULL
ORDER BY m.order_num, m.id;
