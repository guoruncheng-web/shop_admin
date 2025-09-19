# 腾讯云COS文件上传模块

## 功能说明

本模块提供了完整的腾讯云对象存储（COS）文件上传功能，支持：

- 单张图片上传
- 批量图片上传（最多10张）
- 文件删除（单个/批量）
- 文件信息查询
- 自动文件类型验证
- 文件大小限制
- 唯一文件名生成

## 配置说明

### 环境变量配置

在 `.env.development` 文件中添加以下配置：

```bash
# 腾讯云COS配置
COS_SECRET_ID=your_secret_id          # 腾讯云API密钥ID
COS_SECRET_KEY=your_secret_key        # 腾讯云API密钥Key
COS_BUCKET=your_bucket_name           # 存储桶名称
COS_REGION=ap-beijing                 # 存储桶地域
COS_BASE_URL=https://your_bucket_name.cos.ap-beijing.myqcloud.com  # 访问域名
```

### 获取腾讯云配置信息

1. **登录腾讯云控制台**
   - 访问：https://console.cloud.tencent.com/

2. **获取API密钥**
   - 进入：访问管理 > API密钥管理
   - 创建或查看现有密钥
   - 复制 SecretId 和 SecretKey

3. **创建存储桶**
   - 进入：对象存储 > 存储桶列表
   - 创建存储桶，记录存储桶名称和地域

4. **配置访问权限**
   - 设置存储桶为公有读私有写
   - 或配置自定义域名

## API接口说明

### 1. 上传单张图片

```http
POST /api/upload/image
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- file: 图片文件
- folder: 存储文件夹（可选）
```

**响应示例：**
```json
{
  "code": 200,
  "data": {
    "url": "https://example.cos.ap-beijing.myqcloud.com/images/uuid.jpg",
    "key": "images/uuid.jpg",
    "size": 1024000,
    "originalName": "photo.jpg"
  },
  "msg": "上传成功"
}
```

### 2. 批量上传图片

```http
POST /api/upload/images
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- files: 图片文件数组（最多10个）
- folder: 存储文件夹（可选）
```

### 3. 删除文件

```http
DELETE /api/upload/file/{key}
Authorization: Bearer <token>
```

注意：key需要进行URL编码，例如 `images/uuid.jpg` 应编码为 `images%2Fuuid.jpg`

### 4. 批量删除文件

```http
POST /api/upload/delete-files
Content-Type: application/json
Authorization: Bearer <token>

Body:
{
  "keys": ["images/uuid1.jpg", "images/uuid2.jpg"]
}
```

### 5. 获取文件信息

```http
GET /api/upload/file-info/{key}
Authorization: Bearer <token>
```

## 使用示例

### 前端上传示例（JavaScript）

```javascript
// 单张图片上传
async function uploadImage(file, folder = 'images') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return response.json();
}

// 批量上传
async function uploadImages(files, folder = 'images') {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  formData.append('folder', folder);

  const response = await fetch('/api/upload/images', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return response.json();
}
```

### 文件夹组织建议

```
存储桶根目录/
├── images/           # 通用图片
├── products/         # 商品图片
├── banners/          # 轮播图
├── avatars/          # 用户头像
├── categories/       # 分类图片
└── temp/            # 临时文件
```

## 安全说明

1. **文件类型限制**：只允许上传图片文件（jpg, jpeg, png, gif, webp）
2. **文件大小限制**：默认最大5MB，可通过环境变量配置
3. **身份验证**：所有接口都需要JWT令牌验证
4. **文件名安全**：自动生成UUID文件名，避免文件名冲突

## 错误处理

常见错误码：
- `400`: 文件格式不支持、文件过大、参数错误
- `401`: 未授权访问
- `500`: 服务器内部错误、COS配置错误

## 注意事项

1. 确保腾讯云COS配置正确
2. 存储桶需要设置适当的访问权限
3. 建议配置CDN加速访问
4. 定期清理不需要的文件以节省存储成本
5. 生产环境建议使用HTTPS访问