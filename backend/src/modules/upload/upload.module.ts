import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './controllers/upload.controller';
import { UploadService } from './services/upload.service';
import { ChunkUploadService } from './services/chunk-upload.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', // 临时存储目录
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService, ChunkUploadService],
  exports: [UploadService, ChunkUploadService],
})
export class UploadModule {}