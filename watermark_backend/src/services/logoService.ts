import prisma from '../config/database';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { UPLOAD_PATHS, USE_S3 } from '../config/multer';
import { uploadBufferToS3, deleteFromS3, getS3KeyFromUrl } from '../config/s3';

export interface LogoData {
  id: string;
  name: string;
  filename: string;
  url: string;
  width: number;
  height: number;
  isActive: boolean;
}

export const logoService = {
  async createLogo(file: Express.Multer.File, customName?: string): Promise<LogoData> {
    let metadata;
    let url: string;
    let filename: string;

    if (USE_S3) {
      // S3 업로드 (메모리 스토리지 사용)
      const buffer = file.buffer;
      metadata = await sharp(buffer).metadata();

      const s3Result = await uploadBufferToS3(
        buffer,
        file.originalname,
        'logos',
        file.mimetype
      );

      url = s3Result.url;
      filename = s3Result.filename;
    } else {
      // 로컬 저장소 사용 (디스크 스토리지)
      metadata = await sharp(file.path).metadata();
      filename = file.filename;
      url = `/uploads/logos/${filename}`;
    }

    // Deactivate all existing logos
    await prisma.logo.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // 사용자 지정 이름이 있으면 사용, 없으면 파일명 사용
    const logoName = customName?.trim() || file.originalname;

    const logo = await prisma.logo.create({
      data: {
        name: logoName,
        filename,
        url,
        width: metadata.width || 0,
        height: metadata.height || 0,
        isActive: true,
      },
    });

    return logo;
  },

  async getActiveLogo(): Promise<LogoData | null> {
    const logo = await prisma.logo.findFirst({
      where: { isActive: true },
    });
    return logo;
  },

  async getAllLogos(): Promise<LogoData[]> {
    const logos = await prisma.logo.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return logos;
  },

  async getLogoById(id: string): Promise<LogoData | null> {
    const logo = await prisma.logo.findUnique({
      where: { id },
    });
    return logo;
  },

  async setActiveLogo(id: string): Promise<LogoData | null> {
    // Deactivate all logos
    await prisma.logo.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Activate selected logo
    const logo = await prisma.logo.update({
      where: { id },
      data: { isActive: true },
    });

    return logo;
  },

  async deleteLogo(id: string): Promise<boolean> {
    const logo = await prisma.logo.findUnique({
      where: { id },
    });

    if (!logo) {
      return false;
    }

    if (USE_S3) {
      // S3에서 삭제
      const s3Key = getS3KeyFromUrl(logo.url);
      if (s3Key) {
        await deleteFromS3(s3Key);
      }
    } else {
      // 로컬 파일 삭제
      const filePath = path.join(UPLOAD_PATHS.logos, logo.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete from database
    await prisma.logo.delete({
      where: { id },
    });

    return true;
  },
};
