import { Router, Request, Response } from 'express';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { authService } from '../services/authService';
import { ApiResponse, SyncAccountRequest, SyncAccountResponse } from '../types';

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

export default router;
