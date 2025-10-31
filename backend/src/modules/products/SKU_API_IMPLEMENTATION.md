# SKU接口开发技术方案

## 项目概述
实现商品SKU管理系统,支持三级规格的商品管理,包括商品分类、商品基本信息、SKU规格管理等功能。

## 技术架构

### 1. 数据库表设计
已完成的数据库表:
- `categories` - 商品分类表(支持三级分类)
- `products` - 商品基础信息表
- `sku_spec_names` - SKU规格名称表(三级规格)
- `sku_spec_values` - SKU规格值表
- `product_skus` - 商品SKU表

### 2. Entity设计
已创建的Entity:
- `Category` - 分类实体,支持树形结构
- `Product` - 商品实体
- `SkuSpecName` - 规格名称实体
- `SkuSpecValue` - 规格值实体
- `ProductSku` - SKU实体

## 已完成的功能模块

### 1. 商品分类模块 (categories) ✅

#### 接口列表:
1. **GET /categories** - 分页查询分类列表
   - 权限标识: `product:categories:view`
   - 支持筛选: 商户ID、分类名称、分类编码、父分类ID、层级、状态等
   - 商户隔离: 平台超级商户可查询所有,普通商户只能查询自己的

2. **GET /categories/tree** - 获取分类树(不分页)
   - 权限标识: `product:categories:tree`
   - 返回树形结构的分类数据

3. **GET /categories/:id** - 查询分类详情
   - 权限标识: `product:categories:details`
   - 包含商户信息和父分类信息

4. **POST /categories** - 创建分类
   - 权限标识: `product:categories:add`
   - 自动计算层级和路径信息
   - 检查名称重复(同一商户下同一父分类下)
   - 最多支持三级分类

5. **PUT /categories/:id** - 更新分类
   - 权限标识: `product:categories:edit`
   - 支持修改父分类(自动重新计算路径)
   - 检查名称冲突

6. **DELETE /categories/:id** - 删除分类
   - 权限标识: `product:categories:delete`
   - 检查是否有子分类
   - 检查是否有商品

7. **PUT /categories/batch/status** - 批量更新状态
   - 权限标识: `product:categories:batchStatus`

#### 核心逻辑:
- **树形结构管理**: 通过`parentId`和`level`字段实现三级分类
- **路径计算**: `pathIds`和`pathNames`记录完整路径
- **商户隔离**: 所有操作基于`merchantId`隔离

### 2. 商品SKU Entities ✅

已创建完整的实体关系:
- Product实体 - 包含所有商品基本字段
- SkuSpecName实体 - 规格名称,支持三级结构
- SkuSpecValue实体 - 规格值,关联规格名称
- ProductSku实体 - SKU组合,包含三个规格值ID

## 待实现的功能模块

### 3. 商品管理模块 (products)

#### 核心接口设计:

##### 3.1 商品列表查询
```typescript
GET /products
权限: product:products:view
功能:
- 分页查询商品列表
- 支持筛选: 商品名称、编号、品牌、分类、状态、标签(热销/新品/推荐/折扣)
- 返回商品基本信息+统计数据(总库存、总销量)
- 商户隔离
```

##### 3.2 创建商品
```typescript
POST /products
权限: product:products:add
功能:
- 创建商品基本信息
- 自动生成商品编号(PROD-时间戳-随机数)
- 支持单规格和多规格商品
- 单规格: 直接创建一个默认SKU
- 多规格: 创建规格名称、规格值、SKU列表
流程:
1. 验证数据(分类、品牌是否存在)
2. 创建商品记录
3. 如果是多规格:
   a. 创建规格名称(sku_spec_names)
   b. 创建规格值(sku_spec_values)
   c. 创建SKU列表(product_skus)
4. 如果是单规格:
   a. 创建一个默认SKU
5. 计算商品总库存和价格区间
```

##### 3.3 更新商品
```typescript
PUT /products/:id
权限: product:products:edit
功能:
- 更新商品基本信息
- 不支持修改规格结构(需要删除重建)
- 可以更新SKU的价格和库存
```

##### 3.4 删除商品
```typescript
DELETE /products/:id
权限: product:products:delete
功能:
- 软删除商品
- 级联删除SKU规格和SKU列表
```

##### 3.5 查询商品详情
```typescript
GET /products/:id
权限: product:products:details
功能:
- 返回商品完整信息
- 包含品牌、分类信息
- 包含所有SKU规格选项
- 包含所有SKU列表
```

##### 3.6 批量上下架
```typescript
PUT /products/batch/status
权限: product:products:batchStatus
功能: 批量更新商品状态
```

### 4. SKU独立管理接口

#### 4.1 查询商品的SKU列表
```typescript
GET /products/:productId/skus
权限: product:products:skuList
返回:
- 商品的所有SKU
- 包含规格文本和价格库存信息
```

#### 4.2 创建SKU
```typescript
POST /products/skus
权限: product:skus:add
Body:
{
  "productId": 1,
  "specValueId1": 1,     // 可选
  "specValueId2": 2,     // 可选
  "specValueId3": 3,     // 可选
  "price": 99.00,
  "stock": 100,
  "image": "https://...",  // 可选
  "originalPrice": 129.00, // 可选
  "costPrice": 50.00,      // 可选
  "barcode": "123456"      // 可选
}
功能:
- 创建新的SKU
- 自动生成SKU编号
- 检查规格组合唯一性
- 自动生成规格文本
- 同步更新商品总库存和价格
限制:
- 只能为多规格商品(hasSku=1)创建SKU
- 规格组合不能重复
```

#### 4.3 查询SKU详情
```typescript
GET /products/skus/:skuId
权限: product:skus:details
返回:
- SKU完整信息
- 包含商品信息和商户信息
```

#### 4.4 更新SKU
```typescript
PUT /products/skus/:skuId
权限: product:skus:edit
Body: 所有字段可选
{
  "price": 89.00,
  "stock": 150,
  "specValueId1": 2,  // 可以修改规格值
  ...
}
功能:
- 更新SKU信息
- 如果修改规格值,会检查新组合的唯一性
- 自动重新生成规格文本
- 价格或库存变化时同步更新商品汇总信息
```

#### 4.5 删除SKU
```typescript
DELETE /products/skus/:skuId
权限: product:skus:delete
功能:
- 软删除SKU
- 同步更新商品总库存和价格
限制:
- 商品至少需要保留一个SKU
```

#### 4.6 批量更新SKU状态
```typescript
PUT /products/skus/batch/status
权限: product:skus:batchStatus
Body:
{
  "ids": [1, 2, 3],
  "status": 1  // 0-禁用 1-启用
}
```

#### 4.7 更新SKU库存（快捷方式）
```typescript
PUT /products/:productId/skus/:skuId/stock
权限: product:products:updateSkuStock
Body:
{
  "stock": 200
}
功能:
- 快速更新SKU库存
- 同步更新商品总库存
```

## 核心业务逻辑

### 1. 商品创建流程

```typescript
async createProduct(dto: CreateProductDto, user: RequestUser) {
  // 1. 数据验证
  await this.validateCategory(dto.categoryId, user.merchantId);
  if (dto.brandId) {
    await this.validateBrand(dto.brandId, user.merchantId);
  }

  // 2. 生成商品编号
  const productNo = this.generateProductNo();

  // 3. 创建商品记录
  const product = await this.productRepository.save({
    ...dto,
    merchantId: user.merchantId,
    productNo,
    createdBy: user.userId,
  });

  // 4. 处理SKU
  if (dto.hasSku === 1 && dto.skuSpecs && dto.skus) {
    // 多规格商品
    await this.createProductSpecs(product.id, dto.skuSpecs, user.merchantId);
    await this.createProductSkus(product.id, dto.skus, user);
  } else {
    // 单规格商品,创建默认SKU
    await this.createDefaultSku(product.id, dto, user);
  }

  // 5. 计算并更新商品汇总信息
  await this.updateProductSummary(product.id);

  return product;
}
```

### 2. SKU编号生成规则
```
格式: SKU-{商品编号}-{序号}
示例: SKU-PROD20250131001-001
```

### 3. 商品库存和价格同步
```typescript
// SKU库存变化时自动更新商品总库存
async updateProductSummary(productId: number) {
  const skus = await this.skuRepository.find({
    where: { productId, status: 1 },
  });

  const totalStock = skus.reduce((sum, sku) => sum + sku.stock, 0);
  const minPrice = Math.min(...skus.map(sku => sku.price));
  const maxPrice = Math.max(...skus.map(sku => sku.price));

  await this.productRepository.update(productId, {
    stock: totalStock,
    price: minPrice,
  });
}
```

### 4. 规格文本自动生成
```typescript
// 生成SKU规格文本: "红色-XL-纯棉"
function generateSpecText(specValues: SkuSpecValue[]): string {
  return specValues
    .sort((a, b) => a.specName.specLevel - b.specName.specLevel)
    .map(v => v.specValue)
    .join('-');
}
```

## 权限控制

所有接口使用`@Types`装饰器进行权限控制:

```typescript
@Types('product:products:add', { name: '创建商品' })
```

权限标识格式:
- `product:categories:*` - 分类管理权限
- `product:products:*` - 商品管理权限
- `product:skus:*` - SKU管理权限

## 商户隔离策略

1. **数据隔离**: 所有表包含`merchant_id`字段
2. **查询隔离**:
   - 普通商户只能查询自己的数据
   - 平台超级商户可以查询所有数据(通过传递merchantId参数)
3. **操作隔离**: 用户只能操作自己商户下的数据

## 数据验证规则

### 1. 商品创建验证
- 商品名称: 必填,最多200字符
- 分类ID: 必填,且必须存在
- 品牌ID: 选填,如果提供必须存在
- 单规格商品: 必须提供price和stock
- 多规格商品: 必须提供skuSpecs和skus

### 2. SKU验证
- SKU组合唯一性: `(product_id, spec_value_id_1, spec_value_id_2, spec_value_id_3)` 必须唯一
- 价格: >= 0
- 库存: >= 0

### 3. 规格层级验证
- 一级规格: parentId为NULL
- 二级规格: parentId必须是一级规格
- 三级规格: parentId必须是二级规格

## 接口返回格式

统一返回格式:
```typescript
{
  code: 200,
  message: '操作成功',
  data: {
    // 数据内容
  }
}
```

分页返回格式:
```typescript
{
  code: 200,
  message: '查询成功',
  data: {
    list: [],
    total: 100,
    page: 1,
    limit: 10
  }
}
```

## 性能优化

1. **查询优化**:
   - 使用复合索引: `(merchant_id, status)`, `(merchant_id, category_id)`
   - 分页查询避免JOIN过多表

2. **缓存策略**:
   - 商品规格选项: 缓存1小时
   - SKU库存: 缓存5分钟
   - 分类树: 缓存1小时

3. **事务处理**:
   - 创建商品和SKU在同一事务中
   - 库存扣减使用乐观锁

## 错误处理

统一错误码:
- 400: 参数错误
- 401: 未授权
- 403: 无权限
- 404: 资源不存在
- 409: 数据冲突(如名称重复)
- 500: 服务器错误

## 接口测试建议

1. **分类接口测试**:
   - 创建三级分类树
   - 测试分类名称重复
   - 测试删除有子分类的分类
   - 测试树形结构返回

2. **商品接口测试**:
   - 创建单规格商品
   - 创建多规格商品(1/2/3级规格)
   - 测试SKU组合唯一性
   - 测试库存同步
   - 测试价格区间计算

## 下一步开发计划

1. ✅ 商品分类模块 - 已完成
2. ✅ SKU相关Entity - 已完成
3. 🚧 商品管理Service - 进行中
4. ⏳ 商品管理Controller
5. ⏳ 单元测试
6. ⏳ 接口文档完善

## 注意事项

1. 所有操作必须检查商户权限
2. SKU库存变化需要同步更新商品总库存
3. 删除商品时级联删除SKU数据
4. 规格组合必须保证唯一性
5. 价格和库存必须>= 0
6. 商品编号全局唯一
7. 每次改动都要检查ESLint和TS错误
