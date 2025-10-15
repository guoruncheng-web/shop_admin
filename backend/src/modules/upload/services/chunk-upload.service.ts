import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const COS = require('cos-nodejs-sdk-v5');

interface ChunkUploadInfo {
  uploadId: string;
  fileName: string;
  fileSize: number;
  fileMD5: string;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: number[];
  cosUploadId?: string;
  key: string;
  createdAt: Date;
}

@Injectable()
export class ChunkUploadService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cos: any;
  private bucket: string;
  private region: string;
  private uploadInfoMap = new Map<string, ChunkUploadInfo>();
  private tempDir: string;

  constructor(private configService: ConfigService) {
    // 初始化腾讯云COS配置
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.cos = new COS({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      SecretId: this.configService.get('cos.secretId'),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      SecretKey: this.configService.get('cos.secretKey'),
    });

    this.bucket = this.configService.get('cos.bucket');
    this.region = this.configService.get('cos.region');
    this.tempDir = path.join(process.cwd(), 'uploads', 'chunks');

    // 确保临时目录存在
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * 初始化分片上传
   */
  async initChunkUpload(dto: {
    fileName: string;
    fileSize: number;
    fileMD5: string;
    chunkSize: number;
    totalChunks: number;
  }) {
    const uploadId = `upload_${uuidv4()}`;

    // 生成文件存储路径
    const fileExtension = path.extname(dto.fileName);
    const fileName = `${uuidv4()}${fileExtension}`;
    const key = `videos/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${fileName}`;

    // 初始化COS分片上传
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const cosResult = await this.cos.multipartInit({
      Bucket: this.bucket,
      Region: this.region,
      Key: key,
      ContentType: this.getMimeType(fileExtension),
    });

    const uploadInfo: ChunkUploadInfo = {
      uploadId,
      fileName: dto.fileName,
      fileSize: dto.fileSize,
      fileMD5: dto.fileMD5,
      chunkSize: dto.chunkSize,
      totalChunks: dto.totalChunks,
      uploadedChunks: [],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      cosUploadId: cosResult.UploadId,
      key,
      createdAt: new Date(),
    };

    this.uploadInfoMap.set(uploadId, uploadInfo);

    // 创建上传临时目录
    const uploadDir = path.join(this.tempDir, uploadId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    return {
      uploadId,
      key,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      cosUploadId: cosResult.UploadId,
    };
  }

  /**
   * 上传分片
   */
  async uploadChunk(
    uploadId: string,
    chunkIndex: number,
    chunkMD5: string,
    chunkBuffer: Buffer,
  ) {
    const uploadInfo = this.uploadInfoMap.get(uploadId);
    if (!uploadInfo) {
      throw new NotFoundException('上传会话不存在');
    }

    // 验证分片MD5
    const actualMD5 = crypto
      .createHash('md5')
      .update(chunkBuffer)
      .digest('hex');
    if (actualMD5 !== chunkMD5) {
      throw new BadRequestException('分片数据校验失败');
    }

    // 检查分片是否已上传
    if (uploadInfo.uploadedChunks.includes(chunkIndex)) {
      return { message: '分片已存在' };
    }

    try {
      // 上传分片到COS
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const partResult = await this.cos.multipartUpload({
        Bucket: this.bucket,
        Region: this.region,
        Key: uploadInfo.key,
        UploadId: uploadInfo.cosUploadId,
        PartNumber: chunkIndex + 1, // COS的PartNumber从1开始
        Body: chunkBuffer,
      });

      // 记录已上传的分片
      uploadInfo.uploadedChunks.push(chunkIndex);

      // 保存分片信息到临时文件（用于断点续传）
      const chunkInfoPath = path.join(
        this.tempDir,
        uploadId,
        `chunk_${chunkIndex}.json`,
      );
      fs.writeFileSync(
        chunkInfoPath,
        JSON.stringify({
          chunkIndex,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          etag: partResult.ETag,
          partNumber: chunkIndex + 1,
        }),
      );

      return {
        chunkIndex,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        etag: partResult.ETag,
        uploaded: uploadInfo.uploadedChunks.length,
        total: uploadInfo.totalChunks,
      };
    } catch (error) {
      console.error('上传分片失败:', error);
      throw new BadRequestException('分片上传失败');
    }
  }

  /**
   * 检查已上传的分片
   */
  checkUploadedChunks(uploadId: string) {
    const uploadInfo = this.uploadInfoMap.get(uploadId);
    if (!uploadInfo) {
      throw new NotFoundException('上传会话不存在');
    }

    return {
      uploadedChunks: uploadInfo.uploadedChunks,
      total: uploadInfo.totalChunks,
      progress: Math.round(
        (uploadInfo.uploadedChunks.length / uploadInfo.totalChunks) * 100,
      ),
    };
  }

  /**
   * 完成分片上传
   */
  async completeChunkUpload(uploadId: string, fileMD5: string) {
    const uploadInfo = this.uploadInfoMap.get(uploadId);
    if (!uploadInfo) {
      throw new NotFoundException('上传会话不存在');
    }

    // 验证所有分片都已上传
    if (uploadInfo.uploadedChunks.length !== uploadInfo.totalChunks) {
      throw new BadRequestException('还有分片未上传完成');
    }

    // 验证文件MD5
    if (uploadInfo.fileMD5 !== fileMD5) {
      throw new BadRequestException('文件MD5校验失败');
    }

    try {
      // 读取所有分片信息
      const uploadDir = path.join(this.tempDir, uploadId);
      const parts = [];

      for (let i = 0; i < uploadInfo.totalChunks; i++) {
        const chunkInfoPath = path.join(uploadDir, `chunk_${i}.json`);
        if (fs.existsSync(chunkInfoPath)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const chunkInfo = JSON.parse(fs.readFileSync(chunkInfoPath, 'utf8'));
          parts.push({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            PartNumber: chunkInfo.partNumber,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            ETag: chunkInfo.etag,
          });
        }
      }

      // 按PartNumber排序
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      parts.sort((a, b) => a.PartNumber - b.PartNumber);

      // 完成COS分片上传
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await this.cos.multipartComplete({
        Bucket: this.bucket,
        Region: this.region,
        Key: uploadInfo.key,
        UploadId: uploadInfo.cosUploadId,
        Parts: parts,
      });

      // 构建访问URL
      const url = `https://${this.bucket}.cos.${this.region}.myqcloud.com/${uploadInfo.key}`;

      // 清理临时文件和内存数据
      this.cleanupUpload(uploadId);

      return {
        url,
        key: uploadInfo.key,
        size: uploadInfo.fileSize,
        originalName: uploadInfo.fileName,
        mimeType: this.getMimeType(path.extname(uploadInfo.fileName)),
      };
    } catch (error) {
      console.error('完成分片上传失败:', error);
      throw new BadRequestException('完成上传失败');
    }
  }

  /**
   * 取消分片上传
   */
  async cancelChunkUpload(uploadId: string) {
    const uploadInfo = this.uploadInfoMap.get(uploadId);
    if (!uploadInfo) {
      throw new NotFoundException('上传会话不存在');
    }

    try {
      // 取消COS分片上传
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await this.cos.multipartAbort({
        Bucket: this.bucket,
        Region: this.region,
        Key: uploadInfo.key,
        UploadId: uploadInfo.cosUploadId,
      });

      // 清理临时文件和内存数据
      this.cleanupUpload(uploadId);

      return { message: '上传已取消' };
    } catch (error) {
      console.error('取消分片上传失败:', error);
      throw new BadRequestException('取消上传失败');
    }
  }

  /**
   * 清理上传相关的临时文件和内存数据
   */
  private cleanupUpload(uploadId: string) {
    // 删除临时目录
    const uploadDir = path.join(this.tempDir, uploadId);
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }

    // 删除内存中的上传信息
    this.uploadInfoMap.delete(uploadId);
  }

  /**
   * 根据文件扩展名获取MIME类型
   */
  private getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.mp4': 'video/mp4',
      '.avi': 'video/avi',
      '.mov': 'video/mov',
      '.wmv': 'video/wmv',
      '.flv': 'video/flv',
      '.webm': 'video/webm',
      '.mkv': 'video/mkv',
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * 定期清理过期的上传会话（可以通过定时任务调用）
   */
  cleanupExpiredUploads() {
    const now = new Date();
    const expireTime = 24 * 60 * 60 * 1000; // 24小时过期

    for (const [uploadId, uploadInfo] of this.uploadInfoMap.entries()) {
      if (now.getTime() - uploadInfo.createdAt.getTime() > expireTime) {
        this.cancelChunkUpload(uploadId).catch(console.error);
      }
    }
  }
}
