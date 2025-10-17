import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const COS = require('cos-nodejs-sdk-v5');
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  originalName: string;
  mimeType: string;
}

@Injectable()
export class UploadService {
  private cos: any;
  private bucket: string;
  private region: string;

  constructor(private configService: ConfigService) {
    // 初始化腾讯云COS配置
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    this.cos = new COS({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      SecretId: this.configService.get('cos.secretId'),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      SecretKey: this.configService.get('cos.secretKey'),
    });

    this.bucket = this.configService.get('cos.bucket');
    this.region = this.configService.get('cos.region');
  }

  /**
   * 上传图片到腾讯云COS
   */
  async uploadImage(file: Express.Multer.File): Promise<UploadResult> {
    // 验证文件类型
    const allowedImageTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        '只支持上传 JPEG、PNG、GIF、WebP 格式的图片',
      );
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('图片文件大小不能超过 5MB');
    }

    return this.uploadToCOS(file, 'images');
  }

  /**
   * 上传视频到腾讯云COS
   */
  async uploadVideo(file: Express.Multer.File): Promise<UploadResult> {
    // 验证文件类型
    const allowedVideoTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv',
    ];
    if (!allowedVideoTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        '只支持上传 MP4、AVI、MOV、WMV、FLV、WebM、MKV 格式的视频',
      );
    }

    // 验证文件大小 (100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('视频文件大小不能超过 100MB');
    }

    return this.uploadToCOS(file, 'videos');
  }

  /**
   * 通用上传到COS的方法
   */
  private async uploadToCOS(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadResult> {
    try {
      // 生成唯一文件名
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const key = `${folder}/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${fileName}`;

      // 上传到腾讯云COS
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await this.cos.putObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
        Body: fs.createReadStream(file.path),
        ContentLength: file.size,
        ContentType: file.mimetype,
      });

      // 删除临时文件
      fs.unlinkSync(file.path);

      // 构建访问URL
      const url = `https://${this.bucket}.cos.${this.region}.myqcloud.com/${key}`;

      return {
        url,
        key,
        size: file.size,
        originalName: file.originalname,
        mimeType: file.mimetype,
      };
    } catch (error) {
      // 删除临时文件
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      console.error('上传到腾讯云COS失败:', error);
      throw new BadRequestException('文件上传失败，请稍后重试');
    }
  }

  /**
   * 删除COS中的文件
   */
  async deleteFile(key: string): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await this.cos.deleteObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
      });
    } catch (error) {
      console.error('删除COS文件失败:', error);
      throw new BadRequestException('文件删除失败');
    }
  }

  /**
   * 批量删除COS中的文件
   */
  async deleteFiles(keys: string[]): Promise<void> {
    try {
      const objects = keys.map((key) => ({ Key: key }));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await this.cos.deleteMultipleObject({
        Bucket: this.bucket,
        Region: this.region,
        Objects: objects,
      });
    } catch (error) {
      console.error('批量删除COS文件失败:', error);
      throw new BadRequestException('批量删除文件失败');
    }
  }

  /**
   * 获取文件的临时访问URL（用于私有文件）
   */
  getSignedUrl(key: string, expires: number = 3600): string {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const url = this.cos.getObjectUrl({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
        Sign: true,
        Expires: expires, // 过期时间（秒）
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return url;
    } catch (error) {
      console.error('生成签名URL失败:', error);
      throw new BadRequestException('生成访问链接失败');
    }
  }
}
