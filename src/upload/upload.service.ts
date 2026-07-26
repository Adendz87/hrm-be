import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { MinioService } from 'src/minio/minio.service';

@Injectable()
export class UploadService {
  private readonly uploadPath = path.join(
    process.cwd(),
    'uploads',
    'contracts',
  );

  constructor(
    private readonly minioService: MinioService,
  ) {
    fs.mkdirSync(this.uploadPath, {
      recursive: true,
    });
  }

  async saveTemp(
    file: Express.Multer.File,
  ): Promise<string> {

    const ext = path.extname(
      file.originalname,
    );

    const fileName =
      crypto.randomUUID() + ext;

    const tempPath = path.join(
      this.uploadPath,
      fileName,
    );

    await fs.promises.writeFile(
      tempPath,
      file.buffer,
    );

    return tempPath;
  }

  async uploadToStorage(
    tempPath: string,
  ): Promise<string> {
    const bucket = 'contracts';
    const exists =
      await this.minioService.client.bucketExists(
        bucket,
      );


    if (!exists) {

      await this.minioService.client.makeBucket(
        bucket,
      );

    }
    const fileName =
      path.basename(tempPath);
    await this.minioService.client.fPutObject(
      bucket,
      fileName,
      tempPath,
      {
        'Content-Type': 'application/pdf',
      },
    );
    return `${bucket}/${fileName}`;

  }


  async deleteTemp(
    tempPath: string,
  ) {
    try {
      await fs.promises.unlink(tempPath);
    } catch { }
  }

  getFilePath(
    filename: string,
  ) {

    const file = path.join(
      this.uploadPath,
      filename,
    );

    if (!fs.existsSync(file)) {
      throw new NotFoundException(
        'Không tìm thấy file',
      );
    }

    return file;
  }

  delete(filename: string) {

    const file =
      this.getFilePath(filename);

    fs.unlinkSync(file);

    return {
      message: 'Xóa file thành công',
    };
  }
}