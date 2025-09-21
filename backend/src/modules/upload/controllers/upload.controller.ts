import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  BadRequestException,
  Param,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { UploadService, UploadResult } from '../services/upload.service';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@ApiTags('文件上传')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiOperation({
    summary: '上传图片',
    description: '上传图片到腾讯云COS，支持 JPEG、PNG、GIF、WebP 格式，最大 5MB',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: '上传成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            url: { type: 'string', example: 'https://bucket.cos.region.myqcloud.com/images/2024/01/uuid.jpg' },
            key: { type: 'string', example: 'images/2024/01/uuid.jpg' },
            size: { type: 'number', example: 1024000 },
            originalName: { type: 'string', example: 'avatar.jpg' },
            mimeType: { type: 'string', example: 'image/jpeg' },
          },
        },
        msg: { type: 'string', example: '图片上传成功' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '上传失败 - 文件格式不支持或文件过大',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const ext = path.extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的图片文件');
    }

    const result = await this.uploadService.uploadImage(file);
    
    return {
      code: 200,
      data: result,
      msg: '图片上传成功',
    };
  }

  @Post('video')
  @ApiOperation({
    summary: '上传视频',
    description: '上传视频到腾讯云COS，支持 MP4、AVI、MOV、WMV、FLV、WebM、MKV 格式，最大 100MB',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: '上传成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            url: { type: 'string', example: 'https://bucket.cos.region.myqcloud.com/videos/2024/01/uuid.mp4' },
            key: { type: 'string', example: 'videos/2024/01/uuid.mp4' },
            size: { type: 'number', example: 50240000 },
            originalName: { type: 'string', example: 'demo.mp4' },
            mimeType: { type: 'string', example: 'video/mp4' },
          },
        },
        msg: { type: 'string', example: '视频上传成功' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '上传失败 - 文件格式不支持或文件过大',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const ext = path.extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的视频文件');
    }

    const result = await this.uploadService.uploadVideo(file);
    
    return {
      code: 200,
      data: result,
      msg: '视频上传成功',
    };
  }

  @Delete('file/:key')
  @ApiOperation({
    summary: '删除文件',
    description: '从腾讯云COS删除指定的文件',
  })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { type: 'object', example: {} },
        msg: { type: 'string', example: '文件删除成功' },
      },
    },
  })
  async deleteFile(@Param('key') key: string) {
    // URL解码key参数
    const decodedKey = decodeURIComponent(key);
    await this.uploadService.deleteFile(decodedKey);
    
    return {
      code: 200,
      data: {},
      msg: '文件删除成功',
    };
  }

  @Post('batch-delete')
  @ApiOperation({
    summary: '批量删除文件',
    description: '从腾讯云COS批量删除多个文件',
  })
  @ApiResponse({
    status: 200,
    description: '批量删除成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { type: 'object', example: {} },
        msg: { type: 'string', example: '批量删除成功' },
      },
    },
  })
  async batchDeleteFiles(@Body() body: { keys: string[] }) {
    const { keys } = body;
    
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      throw new BadRequestException('请提供要删除的文件key列表');
    }

    await this.uploadService.deleteFiles(keys);
    
    return {
      code: 200,
      data: {},
      msg: '批量删除成功',
    };
  }

  @Post('signed-url')
  @ApiOperation({
    summary: '获取文件临时访问链接',
    description: '获取腾讯云COS文件的临时访问链接（用于私有文件）',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            url: { type: 'string', example: 'https://bucket.cos.region.myqcloud.com/file.jpg?sign=xxx' },
            expires: { type: 'number', example: 3600 },
          },
        },
        msg: { type: 'string', example: '获取临时链接成功' },
      },
    },
  })
  async getSignedUrl(
    @Body() body: { key: string },
    @Query('expires') expires?: number,
  ) {
    const { key } = body;
    
    if (!key) {
      throw new BadRequestException('请提供文件key');
    }

    const expiresIn = expires || 3600; // 默认1小时
    const url = await this.uploadService.getSignedUrl(key, expiresIn);
    
    return {
      code: 200,
      data: {
        url,
        expires: expiresIn,
      },
      msg: '获取临时链接成功',
    };
  }
}