'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { extractTokenFromHash, removeHashFromUrl, getUserInfo } from '@/lib/auth';

/**
 * 페이지 로드 시 URL 해시에서 토큰을 추출하고 유저 정보를 가져오는 컴포넌트
 */
export default function AuthInitializer() {
  const { unifiedToken, setToken, setUserInfo, setLoading } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      // 이미 토큰이 있고 유저 정보도 있으면 스킵
      if (unifiedToken && useAuthStore.getState().userInfo) {
        return;
      }

      // URL 해시에서 토큰 추출
      const tokenFromHash = extractTokenFromHash();
      
      if (tokenFromHash) {
        // 토큰 저장
        setToken(tokenFromHash);
        setLoading(true);

        try {
          // 유저 정보 가져오기
          const userInfo = await getUserInfo(tokenFromHash);
          
          if (userInfo) {
            setUserInfo(userInfo);
            // 콘솔에 유저 정보 표시
            console.log('=== 유저 정보 로드 완료 ===');
            console.log('ID:', userInfo.id);
            console.log('User ID:', userInfo.userId);
            console.log('이메일:', userInfo.email);
            console.log('이름:', userInfo.name);
            console.log('Provider:', userInfo.provider);
            console.log('Clinic ID:', userInfo.clinicId);
            console.log('생성일:', userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleString('ko-KR') : 'N/A');
            console.log('수정일:', userInfo.updatedAt ? new Date(userInfo.updatedAt).toLocaleString('ko-KR') : 'N/A');
            console.log('전체 유저 정보:', userInfo);
            console.log('========================');
          } else {
            console.warn('Failed to load user info');
            // 토큰은 유효하지 않을 수 있으므로 제거하지 않음 (재시도 가능)
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
        } finally {
          setLoading(false);
          // 보안을 위해 URL에서 해시 제거
          removeHashFromUrl();
        }
      } else if (unifiedToken && !useAuthStore.getState().userInfo) {
        // 저장된 토큰이 있지만 유저 정보가 없으면 다시 가져오기 시도
        setLoading(true);
        try {
          const userInfo = await getUserInfo(unifiedToken);
          if (userInfo) {
            setUserInfo(userInfo);
            // 콘솔에 유저 정보 표시
            console.log('=== 유저 정보 로드 완료 (저장된 토큰) ===');
            console.log('ID:', userInfo.id);
            console.log('User ID:', userInfo.userId);
            console.log('이메일:', userInfo.email);
            console.log('이름:', userInfo.name);
            console.log('Provider:', userInfo.provider);
            console.log('Clinic ID:', userInfo.clinicId);
            console.log('생성일:', userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleString('ko-KR') : 'N/A');
            console.log('수정일:', userInfo.updatedAt ? new Date(userInfo.updatedAt).toLocaleString('ko-KR') : 'N/A');
            console.log('전체 유저 정보:', userInfo);
            console.log('====================================');
          }
        } catch (error) {
          console.error('Error loading user info with stored token:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, [unifiedToken, setToken, setUserInfo, setLoading]);

  return null; // UI 렌더링 없음
}
