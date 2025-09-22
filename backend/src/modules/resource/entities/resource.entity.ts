import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ResourceCategory } from './resource-category.entity';

export enum ResourceType {
  IMAGE = 'image',
  VIDEO = 'video'
}

export enum ResourceStatus {
  DELETED = -1,
  DISABLED = 0,
  ACTIVE = 1
}

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, comment: '资源名称' })
  name: string;

  @Column({ length: 500, comment: '资源URL链接' })
  url: string;

  @Column({ type: 'enum', enum: ResourceType, comment: '资源类型' })
  type: ResourceType;

  @Column({ name: 'file_size', type: 'bigint', nullable: true, comment: '文件大小（字节）' })
  fileSize: number;

  @Column({ name: 'file_extension', length: 10, nullable: true, comment: '文件扩展名' })
  fileExtension: string;

  @Column({ name: 'mime_type', length: 100, nullable: true, comment: 'MIME类型' })
  mimeType: string;

  @Column({ nullable: true, comment: '图片/视频宽度' })
  width: number;

  @Column({ nullable: true, comment: '图片/视频高度' })
  height: number;

  @Column({ nullable: true, comment: '视频时长（秒）' })
  duration: number;

  @Column({ name: 'category_id', comment: '分类ID' })
  categoryId: number;

  @Column({ name: 'uploader_id', comment: '上传者ID' })
  uploaderId: number;

  @Column({ name: 'uploader_name', length: 100, comment: '上传者姓名' })
  uploaderName: string;

  @Column({ type: 'text', nullable: true, comment: '资源描述' })
  description: string;

  @Column({ length: 500, nullable: true, comment: '标签，用逗号分隔' })
  tags: string;

  @Column({ name: 'download_count', default: 0, comment: '下载次数' })
  downloadCount: number;

  @Column({ name: 'view_count', default: 0, comment: '查看次数' })
  viewCount: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-正常，0-禁用，-1-已删除' })
  status: ResourceStatus;

  @Column({ name: 'uploaded_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', comment: '上传时间' })
  uploadedAt: Date;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => ResourceCategory, category => category.resources)
  @JoinColumn({ name: 'category_id' })
  category: ResourceCategory;

  // 虚拟字段 - 标签数组
  get tagList(): string[] {
    return this.tags ? this.tags.split(',').map(tag => tag.trim()) : [];
  }

  set tagList(tags: string[]) {
    this.tags = tags.join(',');
  }
}