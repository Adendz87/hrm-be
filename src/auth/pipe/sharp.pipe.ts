// import { Injectable, PipeTransform } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';

// import { Multer } from 'multer';


// @Injectable()
// export class SharpPipe implements PipeTransform<Multer.File, Promise<string>> {
//   constructor(private configService: ConfigService) {}

//   async transform(image: Multer.File): Promise<string> {
//     const s3 = new S3({
//       accessKeyId: this.configService.get<string>('S3_KEY'),
//       secretAccessKey: this.configService.get<string>('S3_SECRET'),
//     });

//     const bucketName = 'cono-image';
//     const randomName = Array(32)
//       .fill(null)
//       .map(() => Math.round(Math.random() * 16).toString(16))
//       .join('');
//     const fileName = `${randomName}.png`;
//     const filePath = `user-avatar/${fileName}`;

//     const fileNameSmall = 'comp_' + fileName;
//     const filePathSmall = `user-avatar/${fileNameSmall}`;

//     await sharp(image.buffer)
//       .resize(150)
//       .png()
//       .toBuffer(async (err, data) => {
//         const compImgUploadParams = {
//           Bucket: bucketName,
//           Key: filePathSmall,
//           Body: data,
//         };

//         const imgUploadParams = {
//           Bucket: bucketName,
//           Key: filePath,
//           Body: image.buffer,
//         };

//         try {
//           const upload_comp_img = await s3
//             .upload(compImgUploadParams)
//             .promise();
//           const upload_img = await s3.upload(imgUploadParams).promise();
//         } catch (error) {
//           throw error;
//         }
//       });

//     return fileName;
//   }
// }
