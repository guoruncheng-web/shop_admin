import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from '../../../database/entities/admin.entity';
import { Role } from '../../../database/entities/role.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto, ChangePasswordDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  // 根据ID获取用户
  async findById(id: number): Promise<Admin> {
    const user = await this.adminRepository.findOne({
      where: { id },
      relations: ['roles'],
      select: [
        'id',
        'username',
        'realName',
        'email',
        'phone',
        'avatar',
        'status',
        'lastLoginTime',
        'lastLoginIp',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  // 根据用户名获取用户
  async findByUsername(username: string): Promise<Admin> {
    const user = await this.adminRepository.findOne({
      where: { username },
      relations: ['roles'],
    });

    return user;
  }

  // 分页查询用户列表
  async findAll(queryDto: QueryUserDto) {
    const {
      page = 1,
      pageSize = 10,
      username,
      realName,
      email,
      status,
      merchantId,
    } = queryDto;

    const queryBuilder = this.adminRepository
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.roles', 'roles')
      .select([
        'admin.id',
        'admin.username',
        'admin.realName',
        'admin.email',
        'admin.phone',
        'admin.avatar',
        'admin.status',
        'admin.lastLoginTime',
        'admin.lastLoginIp',
        'admin.createdAt',
        'admin.updatedAt',
        'roles.id',
        'roles.name',
        'roles.code',
      ]);

    // 添加搜索条件
    if (username) {
      queryBuilder.andWhere('admin.username LIKE :username', {
        username: `%${username}%`,
      });
    }
    if (realName) {
      queryBuilder.andWhere('admin.realName LIKE :realName', {
        realName: `%${realName}%`,
      });
    }
    if (email) {
      queryBuilder.andWhere('admin.email LIKE :email', { email: `%${email}%` });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('admin.status = :status', { status });
    }

    // 添加商户ID过滤条件
    if (merchantId !== undefined) {
      queryBuilder.andWhere('admin.merchantId = :merchantId', { merchantId });
    }

    // 分页
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    // 排序
    queryBuilder.orderBy('admin.createdAt', 'DESC');

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      list: users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 创建用户
  async create(createUserDto: CreateUserDto): Promise<Admin> {
    const { username, email, password, roleIds, ...userData } = createUserDto;

    // 检查用户名是否已存在
    const existingUser = await this.adminRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException('用户名已存在');
      }
      if (existingUser.email === email) {
        throw new ConflictException('邮箱已存在');
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户实体
    const user = this.adminRepository.create({
      ...userData,
      username,
      email,
      password: hashedPassword,
      status: createUserDto.status ?? 1,
    });

    // 处理角色关联
    if (roleIds && roleIds.length > 0) {
      const roles = await this.roleRepository.findByIds(roleIds);
      user.roles = roles;
    }

    return await this.adminRepository.save(user);
  }

  // 更新用户
  async update(id: number, updateUserDto: UpdateUserDto): Promise<Admin> {
    const { roleIds, ...userData } = updateUserDto;

    const user = await this.findById(id);

    // 检查用户名和邮箱唯一性（排除当前用户）
    if (userData.username || userData.email) {
      const conditions = [];
      if (userData.username) {
        conditions.push({ username: userData.username });
      }
      if (userData.email) {
        conditions.push({ email: userData.email });
      }

      const existingUser = await this.adminRepository.findOne({
        where: conditions,
      });

      if (existingUser && existingUser.id !== id) {
        if (existingUser.username === userData.username) {
          throw new ConflictException('用户名已存在');
        }
        if (existingUser.email === userData.email) {
          throw new ConflictException('邮箱已存在');
        }
      }
    }

    // 使用事务来处理更新操作
    return await this.adminRepository.manager.transaction(async (manager) => {
      // 更新基本信息
      if (Object.keys(userData).length > 0) {
        await manager.update(Admin, id, userData);
      }

      // 处理角色关联
      if (roleIds !== undefined) {
        // 先删除现有的角色关联
        await manager.query('DELETE FROM admin_roles WHERE admin_id = ?', [id]);

        // 如果有新的角色，则插入新的关联
        if (roleIds.length > 0) {
          const roles = await manager.findByIds(Role, roleIds);
          if (roles.length > 0) {
            const values = roles
              .map((role) => `(${id}, ${role.id})`)
              .join(', ');
            await manager.query(
              `INSERT INTO admin_roles (admin_id, role_id) VALUES ${values}`,
            );
          }
        }
      }

      // 返回更新后的用户信息
      return await this.findById(id);
    });
  }

  // 删除用户
  async remove(id: number): Promise<void> {
    const user = await this.findById(id);

    // 不能删除自己（这里需要从请求上下文获取当前用户ID，暂时跳过）
    // if (user.id === currentUserId) {
    //   throw new BadRequestException('不能删除自己');
    // }

    await this.adminRepository.remove(user);
  }

  // 批量删除用户
  async batchRemove(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('请选择要删除的用户');
    }

    const users = await this.adminRepository.findByIds(ids);
    if (users.length !== ids.length) {
      throw new NotFoundException('部分用户不存在');
    }

    await this.adminRepository.remove(users);
  }

  // 修改密码
  async changePassword(
    id: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { oldPassword, newPassword } = changePasswordDto;
    const user = await this.adminRepository.findOne({
      where: { id },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证旧密码
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('旧密码不正确');
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await this.adminRepository.update(id, { password: hashedNewPassword });
  }

  // 重置密码
  async resetPassword(id: number, newPassword: string): Promise<void> {
    const user = await this.findById(id);

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await this.adminRepository.update(id, { password: hashedPassword });
  }

  // 启用/禁用用户
  async toggleStatus(id: number): Promise<Admin> {
    // 先获取用户当前状态（不加载关联关系）
    const user = await this.adminRepository.findOne({
      where: { id },
      select: ['id', 'status'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const newStatus = user.status === 1 ? 0 : 1;

    // 直接更新状态字段，避免触发关联关系的保存
    await this.adminRepository.update(id, { status: newStatus });

    // 返回更新后的完整用户信息
    return await this.findById(id);
  }
}
