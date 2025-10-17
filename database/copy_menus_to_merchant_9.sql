-- ========================================
-- 复制商户ID=1的菜单数据到商户ID=9
-- 使用简单的多步复制策略
-- ========================================

-- 清理商户9的现有菜单数据
DELETE FROM menus WHERE merchant_id = 9;

-- ========== 第一步：复制所有菜单数据，但parent_id留空 ==========
-- 先把所有菜单复制过去，parent_id统一设为NULL
DROP TEMPORARY TABLE IF EXISTS old_new_id_mapping;
CREATE TEMPORARY TABLE old_new_id_mapping (
  old_id BIGINT,
  new_id BIGINT,
  old_parent_id BIGINT,
  PRIMARY KEY (old_id),
  KEY idx_new_id (new_id),
  KEY idx_old_parent (old_parent_id)
);

-- 复制菜单数据（暂不处理parent_id关系）
INSERT INTO menus (
  merchant_id, name, path, component, redirect, title, icon, active_icon,
  order_num, hide_in_menu, hide_children_in_menu, hide_in_breadcrumb, hide_in_tab,
  keep_alive, ignore_access, affix_tab, affix_tab_order, is_external, external_link,
  iframe_src, open_in_new_window, badge, badge_type, badge_variants, authority,
  menu_visible_with_forbidden, active_path, max_num_of_open_tab, full_path_key,
  no_basic_layout, type, status, parent_id, level, path_ids, permission_id,
  button_key, query_params, created_by, updated_by, created_by_name, updated_by_name
)
SELECT
  9, name, path, component, redirect, title, icon, active_icon,
  order_num, hide_in_menu, hide_children_in_menu, hide_in_breadcrumb, hide_in_tab,
  keep_alive, ignore_access, affix_tab, affix_tab_order, is_external, external_link,
  iframe_src, open_in_new_window, badge, badge_type, badge_variants, authority,
  menu_visible_with_forbidden, active_path, max_num_of_open_tab, full_path_key,
  no_basic_layout, type, status, NULL, level, path_ids, permission_id,
  button_key, query_params, created_by, updated_by, created_by_name, updated_by_name
FROM menus
WHERE merchant_id = 1
ORDER BY id;

-- ========== 第二步：建立ID映射关系 ==========
-- 通过唯一特征匹配新旧ID
INSERT INTO old_new_id_mapping (old_id, new_id, old_parent_id)
SELECT
  m1.id as old_id,
  m9.id as new_id,
  m1.parent_id as old_parent_id
FROM menus m1
JOIN menus m9 ON m1.name = m9.name
  AND m1.title = m9.title
  AND m1.type = m9.type
  AND IFNULL(m1.path, '') = IFNULL(m9.path, '')
  AND IFNULL(m1.component, '') = IFNULL(m9.component, '')
  AND IFNULL(m1.button_key, '') = IFNULL(m9.button_key, '')
  AND m1.order_num = m9.order_num
WHERE m1.merchant_id = 1
  AND m9.merchant_id = 9
ORDER BY m1.id;

-- ========== 第三步：更新parent_id关系 ==========
-- 创建临时表副本用于parent映射
DROP TEMPORARY TABLE IF EXISTS parent_id_mapping;
CREATE TEMPORARY TABLE parent_id_mapping AS
SELECT old_id, new_id FROM old_new_id_mapping;

-- 根据映射表更新parent_id
UPDATE menus m
JOIN old_new_id_mapping map ON m.id = map.new_id
JOIN parent_id_mapping parent_map ON map.old_parent_id = parent_map.old_id
SET m.parent_id = parent_map.new_id
WHERE m.merchant_id = 9
  AND map.old_parent_id IS NOT NULL;

-- 清理临时表
DROP TEMPORARY TABLE IF EXISTS old_new_id_mapping;
DROP TEMPORARY TABLE IF EXISTS parent_id_mapping;

-- ========== 验证复制结果 ==========
SELECT '=== 菜单复制统计 ===' as info;

SELECT
  merchant_id as '商户ID',
  COUNT(*) as '总菜单数',
  SUM(CASE WHEN type = 1 THEN 1 ELSE 0 END) as '目录数',
  SUM(CASE WHEN type = 2 THEN 1 ELSE 0 END) as '菜单数',
  SUM(CASE WHEN type = 3 THEN 1 ELSE 0 END) as '按钮数'
FROM menus
WHERE merchant_id IN (1, 9)
GROUP BY merchant_id
ORDER BY merchant_id;

SELECT '=== 商户9的顶级菜单 ===' as info;

SELECT id, name, title, type, parent_id
FROM menus
WHERE merchant_id = 9 AND parent_id IS NULL
ORDER BY order_num, id;

SELECT '=== 商户9的二级菜单样例 ===' as info;

SELECT id, name, title, type, parent_id
FROM menus
WHERE merchant_id = 9 AND parent_id IS NOT NULL
ORDER BY parent_id, order_num, id
LIMIT 15;

SELECT '=== 验证parent_id关系是否正确 ===' as info;

SELECT
  COUNT(*) as total_child_menus,
  COUNT(DISTINCT parent_id) as unique_parents,
  SUM(CASE WHEN parent_id IS NOT NULL THEN 1 ELSE 0 END) as has_parent,
  SUM(CASE WHEN parent_id IS NULL THEN 1 ELSE 0 END) as no_parent
FROM menus
WHERE merchant_id = 9;
