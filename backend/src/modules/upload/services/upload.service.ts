import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import COS from 'cos-nodejs-sdk-v5';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class UploadService {
  private cos: COS;

  constructor(private configService: ConfigService) {
    // 初始化腾讯云COS客户端
    this.cos = new COS({
      SecretId: this.configService.get('cos.secretId'),
      SecretKey: this.configService.get('cos.secretKey'),
    });
  }

  /**
   * 上传图片到腾讯云COS
   * @param file 上传的文件
   * @param folder 存储文件夹（可选）
   * @returns 上传结果
   */
  async uploadImage(file: Express.Multer.File, folder?: string): Promise<{
    url: string;
    key: string;
    size: number;
    originalName: string;
  }> {
    try {
      // 验证文件类型
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException('只支持上传图片文件 (jpg, jpeg, png, gif, webp)');
      }

      // 验证文件大小 (默认5MB)
      const maxSize = this.configService.get('upload.maxSize') || 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new BadRequestException(`文件大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`);
      }

      // 生成唯一文件名
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      
      // 构建存储路径
      const folderPath = folder ? `${folder}/` : 'images/';
      const key = `${folderPath}${fileName}`;

      // 上传到腾讯云COS
      const result = await this.cos.putObject({
        Bucket: this.configService.get('cos.bucket'),
        Region: this.configService.get('cos.region'),
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      // 构建访问URL
      const baseUrl = this.configService.get('cos.baseUrl');
      const url = baseUrl ? `${baseUrl}/${key}` : `https://${result.Location}`;

      return {
        url,
        key,
        size: file.size,
        originalName: file.originalname,
      };
    } catch (error) {
      console.error('上传图片失败:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('图片上传失败，请稍后重试');
    }
  }

  /**
   * 批量上传图片
   * @param files 上传的文件数组
   * @param folder 存储文件夹（可选）
   * @returns 上传结果数组
   */
  async uploadImages(files: Express.Multer.File[], folder?: string): Promise<Array<{
    url: string;
    key: string;
    size: number;
    originalName: string;
  }>> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * 删除COS中的文件
   * @param key 文件的key
   * @returns 删除结果
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      await this.cos.deleteObject({
        Bucket: this.configService.get('cos.bucket'),
        Region: this.configService.get('cos.region'),
        Key: key,
      });
      return true;
    } catch (error) {
      console.error('删除文件失败:', error);
      return false;
    }
  }

  /**
   * 批量删除文件
   * @param keys 文件key数组
   * @returns 删除结果
   */
  async deleteFiles(keys: string[]): Promise<{
    success: string[];
    failed: string[];
  }> {
    const results = await Promise.allSettled(
      keys.map(key => this.deleteFile(key).then(success => ({ key, success })))
    );

    const success: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        success.push(keys[index]);
      } else {
        failed.push(keys[index]);
      }
    });

    return { success, failed };
  }

  /**
   * 获取文件信息
   * @param key 文件的key
   * @returns 文件信息
   */
  async getFileInfo(key: string): Promise<any> {
    try {
      const result = await this.cos.headObject({
        Bucket: this.configService.get('cos.bucket'),
        Region: this.configService.get('cos.region'),
        Key: key,
      });
      return result;
    } catch (error) {
      console.error('获取文件信息失败:', error);
      return null;
    }
  }
}