import { UserInfo } from '@/types';
import api from './api';

/**
 * URL 해시에서 unifiedToken 추출
 * 형식: #unifiedToken=xxx 또는 #access_token=xxx&unifiedToken=xxx
 */
export function extractTokenFromHash(): string | null {
  if (typeof window === 'undefined') return null;

  const hash = window.location.hash;
  if (!hash) return null;

  // # 제거
  const hashWithoutSharp = hash.substring(1);
  
  // URL 파라미터 파싱
  const params = new URLSearchParams(hashWithoutSharp);
  
  // unifiedToken 추출
  const token = params.get('unifiedToken') || params.get('access_token');
  
  return token;
}

/**
 * URL에서 해시 제거 (보안을 위해)
 */
export function removeHashFromUrl(): void {
  if (typeof window === 'undefined') return;
  
  // 해시 제거
  if (window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

/**
 * unifiedToken으로 유저 정보 가져오기
 */
export async function getUserInfo(token: string): Promise<UserInfo | null> {
  try {
    const response = await api.getWithToken<UserInfo>('/api/auth/me', token);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    console.error('Failed to get user info:', response.error);
    return null;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}
