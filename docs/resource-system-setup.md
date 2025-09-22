# 资源池系统部署指南

## 系统概述

资源池系统是一个完整的资源管理解决方案，支持图片和视频资源的上传、分类、搜索和统计功能。

## 功能特性

### 🗂️ 分类管理
- **两级分类结构**：支持一级和二级分类
- **分类约束**：只能在二级分类下上传资源
- **分类树展示**：直观的树形结构管理

### 📁 资源管理
- **多媒体支持**：图片和视频资源
- **完整元数据**：文件大小、尺寸、时长等
- **标签系统**：支持多标签分类
- **搜索功能**：名称、描述、标签搜索

### 📊 统计分析
- **实时统计**：资源数量、存储大小、下载次数
- **可视化图表**：类型分布、分类统计
- **热门排行**：下载和查看排行榜

## 部署步骤

### 1. 数据库初始化

```bash
# 进入后端目录
cd backend

# 连接MySQL数据库
mysql -u root -p your_database_name

# 执行迁移脚本
source scripts/migrate-resource-tables.sql
```

或者手动执行迁移文件：

```sql
-- 按顺序执行以下文件
source database/migrations/20250922_create_resource_categories_table.sql;
source database/migrations/20250922_create_resources_table.sql;
source database/migrations/20250922_create_resource_views.sql;
```

### 2. 后端配置

#### 安装依赖
```bash
cd backend
npm install
```

#### 配置数据库连接
在 `src/config/database.config.ts` 中配置数据库连接信息。

#### 注册模块
在 `src/app.module.ts` 中导入 ResourceModule：

```typescript
import { ResourceModule } from './modules/resource/resource.module';

@Module({
  imports: [
    // ... 其他模块
    ResourceModule,
  ],
})
export class AppModule {}
```

#### 启动后端服务
```bash
npm run start:dev
```

### 3. 前端配置

#### 安装依赖
```bash
cd frontend/vben-admin
npm install
```

#### 配置API地址
在前端配置文件中设置后端API地址。

#### 注册路由
确保路由文件 `src/router/routes/modules/resource.ts` 已正确配置。

#### 启动前端服务
```bash
npm run dev
```

## API 接口文档

### 资源分类接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/resource-categories` | 创建分类 |
| GET | `/resource-categories/tree` | 获取分类树 |
| GET | `/resource-categories/second-level` | 获取二级分类 |
| PUT | `/resource-categories/:id` | 更新分类 |
| DELETE | `/resource-categories/:id` | 删除分类 |

### 资源管理接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/resources` | 创建资源 |
| GET | `/resources` | 分页查询资源 |
| GET | `/resources/:id` | 获取资源详情 |
| PUT | `/resources/:id` | 更新资源 |
| DELETE | `/resources/:id` | 删除资源 |
| GET | `/resources/popular` | 热门资源 |
| GET | `/resources/latest` | 最新资源 |
| GET | `/resources/search` | 搜索资源 |
| GET | `/resources/statistics` | 统计信息 |
| POST | `/resources/:id/download` | 记录下载 |

## 数据库表结构

### resource_categories (资源分类表)
- `id`: 主键
- `name`: 分类名称
- `parent_id`: 父分类ID
- `level`: 分类层级 (1-一级, 2-二级)
- `sort_order`: 排序
- `status`: 状态
- `created_at`: 创建时间
- `updated_at`: 更新时间

### resources (资源表)
- `id`: 主键
- `name`: 资源名称
- `url`: 资源URL
- `type`: 资源类型 (image/video)
- `file_size`: 文件大小
- `file_extension`: 文件扩展名
- `mime_type`: MIME类型
- `width`: 宽度
- `height`: 高度
- `duration`: 时长
- `category_id`: 分类ID
- `uploader_id`: 上传者ID
- `uploader_name`: 上传者姓名
- `description`: 描述
- `tags`: 标签
- `download_count`: 下载次数
- `view_count`: 查看次数
- `status`: 状态
- `uploaded_at`: 上传时间
- `created_at`: 创建时间
- `updated_at`: 更新时间

## 使用说明

### 1. 分类管理
1. 访问 "资源管理 > 分类管理"
2. 创建一级分类（如：图片素材、视频素材）
3. 在一级分类下创建二级分类（如：产品图片、广告图片）

### 2. 资源上传
1. 访问 "资源管理 > 资源池"
2. 点击"上传资源"按钮
3. 选择二级分类
4. 上传文件或输入URL
5. 填写资源信息和标签

### 3. 资源搜索
- 使用搜索框按名称搜索
- 使用筛选器按类型、分类、状态筛选
- 点击标签进行标签搜索

### 4. 统计查看
访问 "资源管理 > 统计分析" 查看：
- 资源总数统计
- 类型分布图表
- 热门资源排行
- 存储使用情况

## 注意事项

1. **分类约束**：只能在二级分类下上传资源
2. **文件上传**：需要配置文件上传服务
3. **权限控制**：根据需要添加用户权限验证
4. **性能优化**：大量数据时考虑分页和索引优化
5. **备份策略**：定期备份数据库和文件

## 扩展功能

### 可选扩展
- 文件上传服务集成
- 图片压缩和缩略图生成
- 视频转码和预览
- 批量操作功能
- 资源审核流程
- CDN集成
- 水印添加

### 性能优化
- Redis缓存热门数据
- 数据库分区
- 文件CDN加速
- 图片懒加载
- 分页优化

## 技术栈

### 后端
- NestJS + TypeScript
- TypeORM + MySQL
- Swagger API文档

### 前端
- Vue 3 + TypeScript
- Vben Admin
- Ant Design Vue
- ECharts图表

## 支持与维护

如有问题，请查看：
1. 日志文件排查错误
2. 数据库连接配置
3. API接口调用
4. 前端路由配置

系统已完成基础功能开发，可根据实际需求进行定制化扩展。