import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { UploadService } from './upload.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('upload')
@UseGuards(AuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/contracts',
        filename: (_, file, callback) => {
          callback(null, randomUUID() + extname(file.originalname));
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter(_, file, callback) {
        const allow = [
          '.pdf',
          '.doc',
          '.docx',
        ];

        const ext = extname(file.originalname).toLowerCase();

        if (!allow.includes(ext)) {
          return callback(new Error('Định dạng không hợp lệ'), false);
        }

        callback(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    };
  }

  @Get(':filename')
  download(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    return res.sendFile(this.uploadService.getFilePath(filename));
  }

  @Delete(':filename')
  remove(@Param('filename') filename: string) {
    return this.uploadService.delete(filename);
  }
}