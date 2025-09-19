import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class UploadImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: '要上传的图片文件',
  })
  @IsOptional()
  file?: any;

  @ApiProperty({
    description: '存储文件夹（可选）',
    example: 'products',
    required: false,
  })
  @IsOptional()
  @IsString()
  folder?: string;
}

export class UploadImagesDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: '要上传的图片文件数组',
  })
  files: any[];

  @ApiProperty({
    description: '存储文件夹（可选）',
    example: 'products',
    required: false,
  })
  @IsOptional()
  @IsString()
  folder?: string;
}

export class DeleteFileDto {
  @ApiProperty({
    description: '要删除的文件key数组',
    example: ['images/uuid1.jpg', 'images/uuid2.jpg'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  keys: string[];
}

export class UploadResponseDto {
  @ApiProperty({ description: '响应码', example: 200 })
  code: number;

  @ApiProperty({
    description: '上传结果',
    example: {
      url: 'https://example.cos.ap-beijing.myqcloud.com/images/uuid.jpg',
      key: 'images/uuid.jpg',
      size: 1024000,
      originalName: 'photo.jpg',
    },
  })
  data: {
    url: string;
    key: string;
    size: number;
    originalName: string;
  };

  @ApiProperty({ description: '响应消息', example: '上传成功' })
  msg: string;
}