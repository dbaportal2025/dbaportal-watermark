import { Request, Response, NextFunction } from 'express';

/**
 * API 키 검증 미들웨어
 * x-api-key 헤더를 확인하여 요청을 인증합니다.
 */
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKey = process.env.SUB_DOMAIN_API_KEY;

  // API 키가 환경변수에 설정되지 않은 경우
  if (!validApiKey) {
    console.error('SUB_DOMAIN_API_KEY is not configured in environment variables');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
    });
  }

  // API 키가 헤더에 없는 경우
  if (!apiKey) {
    console.warn('API request rejected: Missing x-api-key header', {
      ip: req.ip,
      path: req.path,
    });
    return res.status(401).json({
      success: false,
      error: 'Missing API key',
    });
  }

  // API 키가 일치하지 않는 경우
  if (apiKey !== validApiKey) {
    console.warn('API request rejected: Invalid API key', {
      ip: req.ip,
      path: req.path,
    });
    return res.status(401).json({
      success: false,
      error: 'Invalid API key',
    });
  }

  // API 키 검증 성공
  next();
};
