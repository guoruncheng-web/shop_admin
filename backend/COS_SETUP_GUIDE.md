# 腾讯云COS配置完整指南

## 🔧 配置步骤

### 1. 登录腾讯云控制台
访问：https://console.cloud.tencent.com/

### 2. 获取API密钥
1. 进入：**访问管理** > **API密钥管理**
2. 点击 **新建密钥** 或查看现有密钥
3. 复制 **SecretId** 和 **SecretKey**（请妥善保管，不要泄露）

### 3. 创建COS存储桶
1. 进入：**对象存储** > **存储桶列表**
2. 点击 **创建存储桶**
3. 配置信息：
   - **存储桶名称**：例如 `my-shop-images`
   - **所属地域**：选择离用户最近的地域，例如 `北京(ap-beijing)`
   - **访问权限**：选择 **公有读私有写**
   - 其他保持默认

### 4. 配置环境变量
修改 `backend/.env.development` 文件：

```bash
# 腾讯云COS配置
COS_SECRET_ID=你的SecretId                    # 从步骤2获取
COS_SECRET_KEY=你的SecretKey                  # 从步骤2获取  
COS_BUCKET=my-shop-images                     # 从步骤3获取存储桶名称
COS_REGION=ap-beijing                         # 从步骤3获取地域
COS_BASE_URL=https://my-shop-images.cos.ap-beijing.myqcloud.com  # 访问域名
```

### 5. 重启服务器
```bash
cd backend
npm run start:dev
```

## 🧪 测试上传功能

### 使用Postman测试
1. **获取登录Token**
   ```
   POST http://localhost:3000/api/auth/login
   Content-Type: application/json
   
   {
     "username": "admin",
     "password": "123456",
     "captcha": "1234",
     "captchaId": "从验证码接口获取"
   }
   ```

2. **上传图片**
   ```
   POST http://localhost:3000/api/upload/image
   Authorization: Bearer 你的token
   Content-Type: multipart/form-data
   
   Body:
   - file: 选择图片文件
   - folder: products (可选)
   ```

### 使用curl测试
```bash
# 1. 获取验证码
curl -X GET "http://localhost:3000/api/auth/captcha"

# 2. 登录获取token
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123456", 
    "captcha": "1234",
    "captchaId": "验证码ID"
  }'

# 3. 上传图片
curl -X POST "http://localhost:3000/api/upload/image" \
  -H "Authorization: Bearer 你的token" \
  -F "file=@/path/to/your/image.jpg" \
  -F "folder=products"
```

## 📁 文件夹组织建议

```
存储桶根目录/
├── products/         # 商品图片
├── banners/          # 轮播图
├── categories/       # 分类图片  
├── avatars/          # 用户头像
├── temp/            # 临时文件
└── uploads/         # 其他上传文件
```

## 🔒 安全配置

### 存储桶权限设置
1. 进入存储桶 > **权限管理** > **存储桶访问权限**
2. 设置为 **公有读私有写**
3. 可以配置防盗链、跨域等安全策略

### API密钥安全
- 不要将密钥提交到代码仓库
- 定期轮换API密钥
- 使用子账号和最小权限原则
- 生产环境使用环境变量或密钥管理服务

## 🌐 域名配置（可选）

### 使用自定义域名
1. 进入存储桶 > **域名与传输管理** > **自定义源站域名**
2. 添加你的域名（需要备案）
3. 配置CNAME解析
4. 更新 `COS_BASE_URL` 为你的自定义域名

### CDN加速（推荐）
1. 开启腾讯云CDN
2. 配置CDN域名
3. 设置缓存策略
4. 更新 `COS_BASE_URL` 为CDN域名

## 🚨 常见问题

### 1. 上传失败 - 403错误
- 检查API密钥是否正确
- 确认存储桶权限设置
- 验证地域配置是否匹配

### 2. 图片无法访问 - 403错误  
- 确认存储桶为公有读权限
- 检查防盗链设置
- 验证URL格式是否正确

### 3. 上传速度慢
- 选择离用户更近的地域
- 开启CDN加速
- 检查网络连接

### 4. 文件名冲突
- 系统自动使用UUID生成唯一文件名
- 如需保留原文件名，可修改上传逻辑

## 💰 费用说明

腾讯云COS按使用量计费：
- **存储费用**：按存储容量计费
- **请求费用**：按API请求次数计费  
- **流量费用**：按下载流量计费
- **CDN费用**：如使用CDN加速

建议：
- 定期清理不需要的文件
- 设置生命周期管理
- 监控使用量和费用

## 📞 技术支持

如遇到问题，可以：
1. 查看腾讯云COS官方文档
2. 联系腾讯云技术支持
3. 检查服务器日志获取详细错误信息