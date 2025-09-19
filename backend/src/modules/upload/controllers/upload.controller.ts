import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  BadRequestException,
  UseGuards,
  Delete,
  Param,
  Get,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UploadService } from '../services/upload.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { UploadImageDto, UploadImagesDto, DeleteFileDto } from '../dto/upload.dto';

@ApiTags('文件上传')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiOperation({ summary: '上传单张图片' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '上传图片文件',
    type: UploadImageDto,
  })
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
            url: { type: 'string', example: 'https://example.cos.ap-beijing.myqcloud.com/images/uuid.jpg' },
            key: { type: 'string', example: 'images/uuid.jpg' },
            size: { type: 'number', example: 1024000 },
            originalName: { type: 'string', example: 'photo.jpg' },
          },
        },
        msg: { type: 'string', example: '上传成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '文件格式不支持或文件过大' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('请选择要上传的图片文件');
    }

    const result = await this.uploadService.uploadImage(file, uploadImageDto.folder);

    return {
      code: 200,
      data: result,
      msg: '上传成功',
    };
  }

  @Post('images')
  @ApiOperation({ summary: '批量上传图片' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '批量上传图片文件',
    type: UploadImagesDto,
  })
  @ApiResponse({
    status: 200,
    description: '批量上传成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              url: { type: 'string', example: 'https://example.cos.ap-beijing.myqcloud.com/images/uuid.jpg' },
              key: { type: 'string', example: 'images/uuid.jpg' },
              size: { type: 'number', example: 1024000 },
              originalName: { type: 'string', example: 'photo.jpg' },
            },
          },
        },
        msg: { type: 'string', example: '批量上传成功' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '文件格式不支持或文件过大' })
  @UseInterceptors(FilesInterceptor('files', 10)) // 最多10个文件
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadImagesDto: UploadImagesDto,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('请选择要上传的图片文件');
    }

    if (files.length > 10) {
      throw new BadRequestException('最多只能同时上传10张图片');
    }

    const results = await this.uploadService.uploadImages(files, uploadImagesDto.folder);

    return {
      code: 200,
      data: results,
      msg: '批量上传成功',
    };
  }

  @Delete('file/:key')
  @ApiOperation({ summary: '删除文件' })
  @ApiParam({
    name: 'key',
    description: '文件的key（需要URL编码）',
    example: 'images%2Fuuid.jpg',
  })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { type: 'boolean', example: true },
        msg: { type: 'string', example: '删除成功' },
      },
    },
  })
  async deleteFile(@Param('key') key: string) {
    // URL解码
    const decodedKey = decodeURIComponent(key);
    const result = await this.uploadService.deleteFile(decodedKey);

    return {
      code: 200,
      data: result,
      msg: result ? '删除成功' : '删除失败',
    };
  }

  @Post('delete-files')
  @ApiOperation({ summary: '批量删除文件' })
  @ApiBody({
    description: '要删除的文件key数组',
    type: DeleteFileDto,
  })
  @ApiResponse({
    status: 200,
    description: '批量删除结果',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            success: {
              type: 'array',
              items: { type: 'string' },
              example: ['images/uuid1.jpg', 'images/uuid2.jpg'],
            },
            failed: {
              type: 'array',
              items: { type: 'string' },
              example: ['images/uuid3.jpg'],
            },
          },
        },
        msg: { type: 'string', example: '批量删除完成' },
      },
    },
  })
  async deleteFiles(@Body() deleteFileDto: DeleteFileDto) {
    const result = await this.uploadService.deleteFiles(deleteFileDto.keys);

    return {
      code: 200,
      data: result,
      msg: '批量删除完成',
    };
  }

  @Get('file-info/:key')
  @ApiOperation({ summary: '获取文件信息' })
  @ApiParam({
    name: 'key',
    description: '文件的key（需要URL编码）',
    example: 'images%2Fuuid.jpg',
  })
  @ApiResponse({
    status: 200,
    description: '获取文件信息成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          description: '文件信息对象',
        },
        msg: { type: 'string', example: '获取成功' },
      },
    },
  })
  async getFileInfo(@Param('key') key: string) {
    // URL解码
    const decodedKey = decodeURIComponent(key);
    const result = await this.uploadService.getFileInfo(decodedKey);

    return {
      code: 200,
      data: result,
      msg: result ? '获取成功' : '文件不存在',
    };
  }
}