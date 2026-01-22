import { Router, Request, Response } from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { authService } from '../services/authService';
import { ApiResponse, SyncAccountRequest, SyncAccountResponse, UserInfoResponse } from '../types';

const router = Router();

/**
 * POST /api/auth/sync-account
 * 서브도메인 계정 동기화 API
 * 
 * Headers:
 *   x-api-key: API 키
 * 
 * Request Body:
 *   {
 *     "email": "user@example.com",
 *     "name": "홍길동",
 *     "provider": "google",
 *     "userId": "uuid-string",
 *     "unifiedToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *   }
 * 
 * Response:
 *   {
 *     "success": true,
 *     "userId": "uuid-string",
 *     "message": "계정 동기화 완료"
 *   }
 */
router.post('/sync-account', apiKeyAuth, async (req: Request, res: Response) => {
  try {
    const { email, name, provider, userId, unifiedToken, clinicId } = req.body as SyncAccountRequest;

    // 요청 바디 검증
    if (!email || !name || !provider || !userId || !unifiedToken) {
      const response: ApiResponse = {
        success: false,
        error: 'Missing required fields: email, name, provider, userId, unifiedToken',
      };
      console.warn('Account sync request rejected: Missing required fields', {
        email: email || 'missing',
        name: name || 'missing',
        provider: provider || 'missing',
        userId: userId || 'missing',
        unifiedToken: unifiedToken ? 'provided' : 'missing',
      });
      return res.status(400).json(response);
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid email format',
      };
      console.warn('Account sync request rejected: Invalid email format', { email });
      return res.status(400).json(response);
    }

    // 계정 동기화 실행
    const result: SyncAccountResponse = await authService.syncAccount({
      email,
      name,
      provider,
      userId,
      unifiedToken,
      clinicId,
    });

    // 성공 로그 출력
    console.log('Account sync successful:', {
      email,
      name,
      provider,
      userId: result.userId,
      clinicId: clinicId || null,
      timestamp: new Date().toISOString(),
    });

    // 성공 응답
    res.status(200).json(result);
  } catch (error) {
    console.error('Error syncing account:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync account',
    };
    res.status(500).json(response);
  }
});

/**
 * GET /api/auth/me
 * unifiedToken으로 사용자 정보 조회 API
 * 
 * Headers:
 *   x-unified-token: 통합 토큰
 *   또는
 *   Authorization: Bearer {unifiedToken}
 * 
 * Response:
 *   {
 *     "success": true,
 *     "data": {
 *       "id": 1,
 *       "userId": 123,
 *       "email": "user@example.com",
 *       "name": "홍길동",
 *       "provider": "google",
 *       "clinicId": 456,
 *       "createdAt": "2024-01-01T00:00:00.000Z",
 *       "updatedAt": "2024-01-01T00:00:00.000Z"
 *     }
 *   }
 */
router.get('/me', apiKeyAuth, async (req: Request, res: Response) => {
  try {
    // 헤더에서 토큰 추출 (x-unified-token 또는 Authorization Bearer)
    let unifiedToken: string | undefined = req.headers['x-unified-token'] as string;
    
    if (!unifiedToken) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        unifiedToken = authHeader.substring(7);
      }
    }

    // 쿼리 파라미터에서도 토큰 받기 (URL 해시에서 추출한 경우 대비)
    if (!unifiedToken) {
      unifiedToken = req.query.token as string;
    }

    if (!unifiedToken) {
      const response: ApiResponse = {
        success: false,
        error: 'Missing unifiedToken. Provide it in x-unified-token header, Authorization Bearer header, or token query parameter',
      };
      return res.status(401).json(response);
    }

    // 사용자 정보 조회
    const userInfo = await authService.getUserByToken(unifiedToken);

    if (!userInfo) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found or invalid token',
      };
      return res.status(404).json(response);
    }

    const result: UserInfoResponse = {
      success: true,
      data: userInfo,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting user info:', error);
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user info',
    };
    res.status(500).json(response);
  }
});

export default router;
