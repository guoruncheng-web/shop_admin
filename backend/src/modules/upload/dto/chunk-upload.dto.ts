import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class InitChunkUploadDto {
  @ApiProperty({
    description: '文件名',
    example: 'video.mp4',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: '文件大小（字节）',
    example: 104857600,
  })
  @IsNumber()
  fileSize: number;

  @ApiProperty({
    description: '文件MD5值',
    example: 'd41d8cd98f00b204e9800998ecf8427e',
  })
  @IsString()
  fileMD5: string;

  @ApiProperty({
    description: '分片大小（字节）',
    example: 2097152,
  })
  @IsNumber()
  chunkSize: number;

  @ApiProperty({
    description: '总分片数',
    example: 50,
  })
  @IsNumber()
  totalChunks: number;
}

export class CompleteChunkUploadDto {
  @ApiProperty({
    description: '上传ID',
    example: 'upload_123456789',
  })
  @IsString()
  uploadId: string;

  @ApiProperty({
    description: '文件MD5值',
    example: 'd41d8cd98f00b204e9800998ecf8427e',
  })
  @IsString()
  fileMD5: string;
}

export class ChunkUploadResponseDto {
  @ApiProperty({ description: '响应码', example: 200 })
  code: number;

  @ApiProperty({
    description: '上传结果',
    example: {
      uploadId: 'upload_123456789',
      url: 'https://example.cos.ap-beijing.myqcloud.com/videos/uuid.mp4',
      key: 'videos/uuid.mp4',
      size: 104857600,
    },
  })
  data: any;

  @ApiProperty({ description: '响应消息', example: '操作成功' })
  msg: string;
}