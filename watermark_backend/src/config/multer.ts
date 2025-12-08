import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB

// S3 사용 여부 (환경변수로 제어)
export const USE_S3 = process.env.USE_S3 === 'true';

// 로컬 저장소 사용 시 디렉토리 생성
if (!USE_S3) {
  const dirs = ['images', 'logos', 'processed'];
  dirs.forEach((dir) => {
    const fullPath = path.join(UPLOAD_DIR, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
}

// 메모리 스토리지 (S3 업로드용)
const memoryStorage = multer.memoryStorage();

// 디스크 스토리지 (로컬 저장용 - 폴백)
const createDiskStorage = (folder: string) => multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(UPLOAD_DIR, folder));
  },
  filename: (_req, file, cb) => {
    const { v4: uuidv4 } = require('uuid');
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// File filter for images
const imageFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG files are allowed'));
  }
};

// Multer instances - S3 사용 시 메모리 스토리지, 아니면 디스크 스토리지
export const uploadImages = multer({
  storage: USE_S3 ? memoryStorage : createDiskStorage('images'),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

export const uploadLogo = multer({
  storage: USE_S3 ? memoryStorage : createDiskStorage('logos'),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

export const UPLOAD_PATHS = {
  images: path.join(UPLOAD_DIR, 'images'),
  logos: path.join(UPLOAD_DIR, 'logos'),
  processed: path.join(UPLOAD_DIR, 'processed'),
};
