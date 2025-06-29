// src/cloudinary/cloudinary.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import cloudinary from "./cloudinary";
import { UploadApiResponse } from "cloudinary";
import * as toStream from "buffer-to-stream";

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>("CLOUDINARY_CLOUD_NAME"),
      api_key: this.configService.get<string>("CLOUDINARY_API_KEY"),
      api_secret: this.configService.get<string>("CLOUDINARY_API_SECRET"),
    });
  }

  async uploadImage(
    buffer: Buffer,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          overwrite: true, // ✅ Allow replacing existing image
          invalidate: true, // ✅ Invalidate old cached versions
          public_id: folder, // ✅ Reuse the same ID to replace the image (e.g. "users/<userId>")
        },
        (error, result) => {
          if (result) resolve(result);
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          else reject(error);
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      toStream(buffer).pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }
}
