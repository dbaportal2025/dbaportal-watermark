import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// S3 클라이언트 설정
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'koco-dental-files';
const S3_BASE_URL = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-northeast-2'}.amazonaws.com`;

export interface S3UploadResult {
  key: string;
  url: string;
  filename: string;
}

/**
 * 버퍼를 S3에 업로드
 */
export async function uploadBufferToS3(
  buffer: Buffer,
  originalFilename: string,
  folder: 'logos' | 'images' | 'processed',
  contentType: string
): Promise<S3UploadResult> {
  const ext = path.extname(originalFilename);
  const filename = `${uuidv4()}${ext}`;
  const key = `watermark/${folder}/${filename}`;

  console.log('=== S3 Upload ===');
  console.log('Bucket:', BUCKET_NAME);
  console.log('Key:', key);
  console.log('ContentType:', contentType);
  console.log('Buffer size:', buffer.length);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  try {
    await s3Client.send(command);
    console.log('S3 upload successful!');
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }

  const result = {
    key,
    url: `${S3_BASE_URL}/${key}`,
    filename,
  };

  console.log('S3 result URL:', result.url);
  return result;
}

/**
 * 파일 경로로부터 S3에 업로드 (multer 파일용)
 */
export async function uploadFileToS3(
  filePath: string,
  originalFilename: string,
  folder: 'logos' | 'images' | 'processed',
  contentType: string
): Promise<S3UploadResult> {
  const fs = await import('fs');
  const buffer = fs.readFileSync(filePath);

  const result = await uploadBufferToS3(buffer, originalFilename, folder, contentType);

  // 로컬 임시 파일 삭제
  try {
    fs.unlinkSync(filePath);
  } catch (e) {
    console.warn('Failed to delete temp file:', e);
  }

  return result;
}

/**
 * S3에서 파일 삭제
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    return false;
  }
}

/**
 * S3 URL에서 키 추출
 */
export function getS3KeyFromUrl(url: string): string | null {
  if (!url.includes(BUCKET_NAME)) {
    return null;
  }

  const urlParts = url.split(`${BUCKET_NAME}.s3.`);
  if (urlParts.length < 2) {
    return null;
  }

  // URL 형식: https://bucket.s3.region.amazonaws.com/key
  const keyPart = urlParts[1].split('.amazonaws.com/')[1];
  return keyPart || null;
}

/**
 * S3에서 파일 가져오기 (버퍼로)
 */
export async function getFileFromS3(key: string): Promise<Buffer | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (response.Body) {
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    }

    return null;
  } catch (error) {
    console.error('Error getting file from S3:', error);
    return null;
  }
}

export { s3Client, BUCKET_NAME, S3_BASE_URL };
