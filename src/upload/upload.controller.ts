import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from 'src/auth/auth.guard';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@Controller('upload')
@UseGuards(AuthGuard)
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './storage/uploads',
        filename: (_, file, callback) => {
          const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1e9);

          callback(
            null,
            uniqueName + extname(file.originalname),
          );
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: UploadedFile) {
    return {
      url: `/storage/uploads/${file.filename}`,
      filename: file.filename,
    };
  }
}