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
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import {
  OperationLog,
  ModuleNames,
  OperationTypes,
} from '../../operation-log/decorators/operation-log.decorator';
import { UploadService } from '../services/upload.service';
import { ChunkUploadService } from '../services/chunk-upload.service';
import {
  InitChunkUploadDto,
  CompleteChunkUploadDto,
} from '../dto/chunk-upload.dto';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('文件上传')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly chunkUploadService: ChunkUploadService,
  ) {}

  @Post('image')
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.FILE_UPLOAD.operation,
    description: '上传图片',
    includeParams: true,
    includeResponse: true,
  })
  @ApiOperation({
    summary: '上传图片',
    description:
      '上传图片到腾讯云COS，支持 JPEG、PNG、GIF、WebP 格式，最大 5MB',
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
            url: {
              type: 'string',
              example:
                'https://bucket.cos.region.myqcloud.com/images/2024/01/uuid.jpg',
            },
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
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.FILE_UPLOAD.operation,
    description: '上传视频',
    includeParams: true,
    includeResponse: true,
  })
  @ApiOperation({
    summary: '上传视频',
    description:
      '上传视频到腾讯云COS，支持 MP4、AVI、MOV、WMV、FLV、WebM、MKV 格式，最大 100MB',
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
            url: {
              type: 'string',
              example:
                'https://bucket.cos.region.myqcloud.com/videos/2024/01/uuid.mp4',
            },
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
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.FILE_DELETE.operation,
    description: '删除文件',
    businessIdField: 'key',
  })
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
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.FILE_DELETE.operation,
    description: '批量删除文件',
    includeParams: true,
  })
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
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.VIEW.operation,
    description: '获取文件临时访问链接',
    includeParams: true,
  })
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
            url: {
              type: 'string',
              example:
                'https://bucket.cos.region.myqcloud.com/file.jpg?sign=xxx',
            },
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

  // ==================== 分片上传相关接口 ====================

  @Post('chunk/init')
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.FILE_UPLOAD.operation,
    description: '初始化分片上传',
    includeParams: true,
    includeResponse: true,
  })
  @ApiOperation({
    summary: '初始化分片上传',
    description: '初始化大文件分片上传，返回上传ID',
  })
  @ApiResponse({
    status: 200,
    description: '初始化成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            uploadId: { type: 'string', example: 'upload_123456789' },
            key: { type: 'string', example: 'videos/2024/01/uuid.mp4' },
            cosUploadId: { type: 'string', example: 'cos_upload_id' },
          },
        },
        msg: { type: 'string', example: '初始化分片上传成功' },
      },
    },
  })
  async initChunkUpload(@Body() dto: InitChunkUploadDto) {
    const result = await this.chunkUploadService.initChunkUpload(dto);

    return {
      code: 200,
      data: result,
      msg: '初始化分片上传成功',
    };
  }

  @Post('chunk')
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.FILE_UPLOAD.operation,
    description: '上传分片',
    includeParams: true,
    includeResponse: true,
  })
  @ApiOperation({
    summary: '上传分片',
    description: '上传文件分片',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: '分片上传成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            chunkIndex: { type: 'number', example: 0 },
            etag: { type: 'string', example: 'etag_value' },
            uploaded: { type: 'number', example: 1 },
            total: { type: 'number', example: 10 },
          },
        },
        msg: { type: 'string', example: '分片上传成功' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('chunk', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          cb(null, `chunk_${uniqueSuffix}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per chunk
      },
    }),
  )
  async uploadChunk(
    @UploadedFile() chunk: Express.Multer.File,
    @Body('uploadId') uploadId: string,
    @Body('chunkIndex') chunkIndex: string,
    @Body('chunkMD5') chunkMD5: string,
  ) {
    if (!chunk) {
      throw new BadRequestException('请提供分片文件');
    }

    if (!uploadId || !chunkIndex || !chunkMD5) {
      throw new BadRequestException('缺少必要参数');
    }

    try {
      // 读取分片数据

      const chunkBuffer = fs.readFileSync(chunk.path);

      const result = await this.chunkUploadService.uploadChunk(
        uploadId,
        parseInt(chunkIndex),
        chunkMD5,

        chunkBuffer,
      );

      // 删除临时文件

      fs.unlinkSync(chunk.path);

      return {
        code: 200,
        data: result,
        msg: '分片上传成功',
      };
    } catch (error) {
      // 确保删除临时文件

      if (fs.existsSync(chunk.path)) {
        fs.unlinkSync(chunk.path);
      }
      throw error;
    }
  }

  @Get('chunk/check/:uploadId')
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.VIEW.operation,
    description: '检查已上传分片',
    businessIdField: 'uploadId',
  })
  @ApiOperation({
    summary: '检查已上传分片',
    description: '检查指定上传ID的已上传分片状态',
  })
  @ApiResponse({
    status: 200,
    description: '检查成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            uploadedChunks: {
              type: 'array',
              items: { type: 'number' },
              example: [0, 1, 2],
            },
            total: { type: 'number', example: 10 },
            progress: { type: 'number', example: 30 },
          },
        },
        msg: { type: 'string', example: '检查完成' },
      },
    },
  })
  async checkUploadedChunks(@Param('uploadId') uploadId: string) {
    const result = await this.chunkUploadService.checkUploadedChunks(uploadId);

    return {
      code: 200,
      data: result,
      msg: '检查完成',
    };
  }

  @Post('chunk/complete')
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.FILE_UPLOAD.operation,
    description: '完成分片上传',
    includeParams: true,
    includeResponse: true,
  })
  @ApiOperation({
    summary: '完成分片上传',
    description: '合并所有分片，完成文件上传',
  })
  @ApiResponse({
    status: 200,
    description: '上传完成',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              example: 'https://bucket.cos.region.myqcloud.com/videos/uuid.mp4',
            },
            key: { type: 'string', example: 'videos/uuid.mp4' },
            size: { type: 'number', example: 104857600 },
            originalName: { type: 'string', example: 'video.mp4' },
            mimeType: { type: 'string', example: 'video/mp4' },
          },
        },
        msg: { type: 'string', example: '文件上传完成' },
      },
    },
  })
  async completeChunkUpload(@Body() dto: CompleteChunkUploadDto) {
    const result = await this.chunkUploadService.completeChunkUpload(
      dto.uploadId,
      dto.fileMD5,
    );

    return {
      code: 200,
      data: result,
      msg: '文件上传完成',
    };
  }

  @Delete('chunk/:uploadId')
  @OperationLog({
    module: ModuleNames.FILE,
    operation: OperationTypes.FILE_DELETE.operation,
    description: '取消分片上传',
    businessIdField: 'uploadId',
  })
  @ApiOperation({
    summary: '取消分片上传',
    description: '取消指定的分片上传任务',
  })
  @ApiResponse({
    status: 200,
    description: '取消成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { type: 'object', example: {} },
        msg: { type: 'string', example: '上传已取消' },
      },
    },
  })
  async cancelChunkUpload(@Param('uploadId') uploadId: string) {
    const result = await this.chunkUploadService.cancelChunkUpload(uploadId);

    return {
      code: 200,
      data: result,
      msg: '上传已取消',
    };
  }
}
