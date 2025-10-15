import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from './entities/merchant.entity';
import { MerchantShippingAddress } from './entities/merchant-shipping-address.entity';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { QueryMerchantDto } from './dto/query-merchant.dto';
import { Admin } from '../../database/entities/admin.entity';
import { Role } from '../../database/entities/role.entity';

import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MerchantsService {
  constructor(
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    @InjectRepository(MerchantShippingAddress)
    private shippingAddressRepository: Repository<MerchantShippingAddress>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  /**
   * 创建商户
   */
  async create(
    createMerchantDto: CreateMerchantDto,
    currentUser?: { userId?: number; id?: number },
  ): Promise<any> {
    // 检查商户编码是否已存在
    const existingMerchant = await this.merchantRepository.findOne({
      where: { merchantCode: createMerchantDto.merchantCode },
    });

    if (existingMerchant) {
      throw new ConflictException(
        `商户编码 ${createMerchantDto.merchantCode} 已存在`,
      );
    }

    // 生成API密钥对
    const apiKey = this.generateApiKey();
    const apiSecret = this.generateApiSecret();

    // 创建商户实体
    const merchant = this.merchantRepository.create({
      ...createMerchantDto,
      apiKey,
      apiSecret,
      certificationStatus: 0, // 默认未认证
      balance: 0,
      frozenBalance: 0,
      totalSales: 0,
      createdBy: currentUser?.userId || currentUser?.id || null,
      updatedBy: currentUser?.userId || currentUser?.id || null,
    });

    const savedMerchant = await this.merchantRepository.save(merchant);

    // 创建发货地址（如果提供）
    if (createMerchantDto.shippingAddress) {
      const shippingAddress = this.shippingAddressRepository.create({
        ...createMerchantDto.shippingAddress,
        merchantId: savedMerchant.id,
        isDefault: 1,
        createdBy: currentUser?.userId || currentUser?.id || null,
        updatedBy: currentUser?.userId || currentUser?.id || null,
      });
      await this.shippingAddressRepository.save(shippingAddress);
    }

    // 1. 生成随机唯一的管理员账号和密码
    const { username, plaintextPassword } =
      await this.generateUniqueAdminCredentials();

    // 2. 创建超级管理员
    const hashedPassword = await bcrypt.hash(plaintextPassword, 10);
    const admin = this.adminRepository.create({
      username,
      password: hashedPassword,
      realName: `${savedMerchant.merchantName}-超级管理员`,
      email: `${username}@${savedMerchant.merchantCode.toLowerCase()}.com`,
      status: 1,
      merchantId: savedMerchant.id,
    });
    const savedAdmin = await this.adminRepository.save(admin);

    // 3. 创建超级管理员角色
    const roleCode = await this.generateUniqueRoleCode();
    const role = this.roleRepository.create({
      name: '超级管理员',
      code: roleCode,
      description: `${savedMerchant.merchantName}的超级管理员角色`,
      status: 1,
      merchantId: savedMerchant.id,
    });
    const savedRole = await this.roleRepository.save(role);

    // 4. 绑定管理员到角色（通过中间表 admin_roles）
    await this.adminRepository
      .createQueryBuilder()
      .relation(Admin, 'roles')
      .of(savedAdmin)
      .add(savedRole);

    // 8. 返回商户信息和管理员凭证
    return {
      ...savedMerchant,
      superAdmin: {
        username,
        password: plaintextPassword, // 明文密码，仅在创建时返回
        email: savedAdmin.email,
      },
    };
  }

  /**
   * 生成唯一的管理员用户名和密码
   */
  private async generateUniqueAdminCredentials(): Promise<{
    username: string;
    plaintextPassword: string;
  }> {
    let username: string;
    let plaintextPassword: string;
    let isUnique = false;

    while (!isUnique) {
      // 生成随机用户名（8位字母+数字）
      username = `admin_${this.generateRandomString(8)}`;

      // 生成随机密码（12位包含大小写字母+数字+特殊字符）
      plaintextPassword = this.generateRandomPassword(12);

      // 检查用户名唯一性
      const existingAdmin = await this.adminRepository.findOne({
        where: { username },
      });

      if (!existingAdmin) {
        isUnique = true;
      }
    }

    return { username, plaintextPassword };
  }

  /**
   * 生成唯一的角色代码
   */
  private async generateUniqueRoleCode(): Promise<string> {
    let roleCode: string;
    let isUnique = false;

    while (!isUnique) {
      // 生成随机角色代码
      roleCode = `SUPER_ADMIN_${this.generateRandomString(8).toUpperCase()}`;

      // 检查角色代码唯一性
      const existingRole = await this.roleRepository.findOne({
        where: { code: roleCode },
      });

      if (!existingRole) {
        isUnique = true;
      }
    }

    return roleCode;
  }

  /**
   * 生成随机字符串（字母+数字）
   */
  private generateRandomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成随机密码（包含大小写字母、数字、特殊字符）
   */
  private generateRandomPassword(length: number): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    const all = lowercase + uppercase + numbers + special;

    // 确保至少包含每种类型的字符
    let password = '';
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += special.charAt(Math.floor(Math.random() * special.length));

    // 填充剩余长度
    for (let i = password.length; i < length; i++) {
      password += all.charAt(Math.floor(Math.random() * all.length));
    }

    // 打乱顺序
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * 查询商户列表（分页）
   */
  async findAll(queryDto: QueryMerchantDto) {
    const { page = 1, pageSize = 10, ...filters } = queryDto;

    const queryBuilder = this.merchantRepository
      .createQueryBuilder('merchant')
      .leftJoinAndSelect('merchant.shippingAddress', 'shippingAddress');

    // 应用过滤条件
    if (filters.merchantCode) {
      queryBuilder.andWhere('merchant.merchantCode LIKE :merchantCode', {
        merchantCode: `%${filters.merchantCode}%`,
      });
    }

    if (filters.merchantName) {
      queryBuilder.andWhere('merchant.merchantName LIKE :merchantName', {
        merchantName: `%${filters.merchantName}%`,
      });
    }

    if (filters.merchantType !== undefined) {
      queryBuilder.andWhere('merchant.merchantType = :merchantType', {
        merchantType: filters.merchantType,
      });
    }

    if (filters.status !== undefined) {
      queryBuilder.andWhere('merchant.status = :status', {
        status: filters.status,
      });
    }

    if (filters.certificationStatus !== undefined) {
      queryBuilder.andWhere(
        'merchant.certificationStatus = :certificationStatus',
        {
          certificationStatus: filters.certificationStatus,
        },
      );
    }

    if (filters.contactPhone) {
      queryBuilder.andWhere('merchant.contactPhone LIKE :contactPhone', {
        contactPhone: `%${filters.contactPhone}%`,
      });
    }

    if (filters.contactEmail) {
      queryBuilder.andWhere('merchant.contactEmail LIKE :contactEmail', {
        contactEmail: `%${filters.contactEmail}%`,
      });
    }

    // 排序
    queryBuilder.orderBy('merchant.createdAt', 'DESC');

    // 分页
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    // 执行查询
    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      code: 200,
      data: {
        items,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / pageSize),
      },
      msg: '查询成功',
    };
  }

  /**
   * 查询单个商户
   */
  async findOne(id: number): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({
      where: { id },
      relations: ['shippingAddress'],
    });

    if (!merchant) {
      throw new NotFoundException(`商户 ID ${id} 不存在`);
    }

    return merchant;
  }

  /**
   * 根据商户编码查询
   */
  async findByCode(merchantCode: string): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({
      where: { merchantCode },
    });

    if (!merchant) {
      throw new NotFoundException(`商户编码 ${merchantCode} 不存在`);
    }

    return merchant;
  }

  /**
   * 更新商户
   */
  async update(
    id: number,
    updateMerchantDto: UpdateMerchantDto,
    currentUser?: { userId?: number; id?: number },
  ): Promise<Merchant> {
    const merchant = await this.findOne(id);

    // 如果要更新商户编码，检查是否重复
    if (
      updateMerchantDto.merchantCode &&
      updateMerchantDto.merchantCode !== merchant.merchantCode
    ) {
      const existing = await this.merchantRepository.findOne({
        where: { merchantCode: updateMerchantDto.merchantCode },
      });

      if (existing) {
        throw new ConflictException(
          `商户编码 ${updateMerchantDto.merchantCode} 已存在`,
        );
      }
    }

    // 处理发货地址
    if (updateMerchantDto.shippingAddress) {
      const addressData = updateMerchantDto.shippingAddress;

      // 检查必填字段是否都有值
      const hasAllRequiredFields =
        addressData.contactName &&
        addressData.contactPhone &&
        addressData.provinceCode &&
        addressData.provinceName &&
        addressData.cityCode &&
        addressData.cityName &&
        addressData.districtCode &&
        addressData.districtName &&
        addressData.detailAddress;

      if (!hasAllRequiredFields) {
        throw new BadRequestException('发货地址信息不完整，请填写所有必填字段');
      }

      const existingAddress = await this.shippingAddressRepository.findOne({
        where: { merchantId: id },
      });

      if (existingAddress) {
        // 更新现有地址 - 只更新允许修改的字段
        existingAddress.contactName = addressData.contactName;
        existingAddress.contactPhone = addressData.contactPhone;
        existingAddress.provinceCode = addressData.provinceCode;
        existingAddress.provinceName = addressData.provinceName;
        existingAddress.cityCode = addressData.cityCode;
        existingAddress.cityName = addressData.cityName;
        existingAddress.districtCode = addressData.districtCode;
        existingAddress.districtName = addressData.districtName;
        existingAddress.detailAddress = addressData.detailAddress;
        existingAddress.postalCode = addressData.postalCode || null;
        existingAddress.updatedBy =
          currentUser?.userId || currentUser?.id || null;

        await this.shippingAddressRepository.save(existingAddress);
      } else {
        // 创建新地址
        const shippingAddress = this.shippingAddressRepository.create({
          contactName: addressData.contactName,
          contactPhone: addressData.contactPhone,
          provinceCode: addressData.provinceCode,
          provinceName: addressData.provinceName,
          cityCode: addressData.cityCode,
          cityName: addressData.cityName,
          districtCode: addressData.districtCode,
          districtName: addressData.districtName,
          detailAddress: addressData.detailAddress,
          postalCode: addressData.postalCode || null,
          merchantId: id,
          isDefault: 1,
          createdBy: currentUser?.userId || currentUser?.id || null,
          updatedBy: currentUser?.userId || currentUser?.id || null,
        });
        await this.shippingAddressRepository.save(shippingAddress);
      }
    }

    // 从 DTO 中移除 shippingAddress，避免直接保存到 merchant 表
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { shippingAddress, ...merchantData } = updateMerchantDto;

    // 更新字段
    Object.assign(merchant, merchantData);
    merchant.updatedBy = currentUser?.userId || currentUser?.id || null;

    return await this.merchantRepository.save(merchant);
  }

  /**
   * 删除商户（软删除或硬删除）
   */
  async remove(id: number): Promise<void> {
    const merchant = await this.findOne(id);

    // 检查是否是超级商户
    if (merchant.merchantType === 1) {
      throw new BadRequestException('超级商户不允许删除');
    }

    // 这里可以添加更多检查，比如是否有关联的管理员、商品等
    // 为了安全，建议使用软删除，将status设置为禁用

    await this.merchantRepository.remove(merchant);
  }

  /**
   * 更新商户状态
   */
  async updateStatus(
    id: number,
    status: number,
    currentUser?: { userId?: number; id?: number },
  ): Promise<Merchant> {
    const merchant = await this.findOne(id);

    if (merchant.merchantType === 1 && status !== 1) {
      throw new BadRequestException('超级商户不允许禁用或冻结');
    }

    merchant.status = status;
    merchant.updatedBy = currentUser?.userId || currentUser?.id || null;

    return await this.merchantRepository.save(merchant);
  }

  /**
   * 更新认证状态
   */
  async updateCertificationStatus(
    id: number,
    certificationStatus: number,
    currentUser?: { userId?: number; id?: number },
  ): Promise<Merchant> {
    const merchant = await this.findOne(id);

    merchant.certificationStatus = certificationStatus;

    // 如果是认证通过，记录认证时间
    if (certificationStatus === 2) {
      merchant.certificationTime = new Date();
    }

    merchant.updatedBy = currentUser?.userId || currentUser?.id || null;

    return await this.merchantRepository.save(merchant);
  }

  /**
   * 获取商户统计信息
   */
  async getStatistics(id: number) {
    const merchant = await this.findOne(id);

    // 这里可以查询关联的管理员数量、商品数量等
    // 暂时返回基础统计
    return {
      code: 200,
      data: {
        merchantId: merchant.id,
        merchantName: merchant.merchantName,
        balance: merchant.balance,
        frozenBalance: merchant.frozenBalance,
        totalSales: merchant.totalSales,
        maxProducts: merchant.maxProducts,
        maxAdmins: merchant.maxAdmins,
        maxStorage: merchant.maxStorage,
        // 这些需要实际查询
        currentProducts: 0,
        currentAdmins: 0,
        usedStorage: 0,
      },
      msg: '查询成功',
    };
  }

  /**
   * 生成API Key
   */
  private generateApiKey(): string {
    return `mk_${crypto.randomBytes(24).toString('hex')}`;
  }

  /**
   * 生成API Secret
   */
  private generateApiSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 重新生成API密钥对
   */
  async regenerateApiKeys(
    id: number,
    currentUser?: { userId?: number; id?: number },
  ): Promise<{ apiKey: string; apiSecret: string }> {
    const merchant = await this.findOne(id);

    const apiKey = this.generateApiKey();
    const apiSecret = this.generateApiSecret();

    merchant.apiKey = apiKey;
    merchant.apiSecret = apiSecret;
    merchant.updatedBy = currentUser?.userId || currentUser?.id || null;

    await this.merchantRepository.save(merchant);

    return { apiKey, apiSecret };
  }

  /**
   * 获取商户的超级管理员信息
   */
  async getSuperAdmin(id: number) {
    await this.findOne(id);

    // 查找该商户的第一个管理员（通常是创建时自动生成的超级管理员）
    const admin = await this.adminRepository.findOne({
      where: { merchantId: id },
      order: { createdAt: 'ASC' },
      relations: ['roles'],
    });

    if (!admin) {
      throw new NotFoundException(`商户 ${id} 没有关联的管理员`);
    }

    return {
      id: admin.id,
      username: admin.username,
      realName: admin.realName,
      email: admin.email,
      phone: admin.phone,
      status: admin.status,
      roles: admin.roles?.map((role) => ({
        id: role.id,
        name: role.name,
        code: role.code,
      })),
      createdAt: admin.createdAt,
      // 注意：不返回密码，因为已加密
    };
  }

  /**
   * 重置商户超级管理员密码
   */
  async resetSuperAdminPassword(
    id: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _currentUser?: { userId?: number; id?: number },
  ) {
    await this.findOne(id);

    // 查找该商户的第一个管理员
    const admin = await this.adminRepository.findOne({
      where: { merchantId: id },
      order: { createdAt: 'ASC' },
    });

    if (!admin) {
      throw new NotFoundException(`商户 ${id} 没有关联的管理员`);
    }

    // 生成新密码
    const newPassword = this.generateRandomPassword(12);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    admin.password = hashedPassword;
    await this.adminRepository.save(admin);

    return {
      username: admin.username,
      password: newPassword, // 明文密码，仅此次返回
      email: admin.email,
    };
  }
}
