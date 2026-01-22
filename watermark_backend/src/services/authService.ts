import prisma from '../config/database';

export interface SyncAccountRequest {
  email: string;
  name: string;
  provider: string;
  userId: string;
  unifiedToken: string;
  clinicId?: number;
}

export interface SyncAccountResponse {
  success: true;
  userId: string;
  message: string;
}

export const authService = {
  /**
   * 계정 동기화 (이메일 기준으로 find or create)
   * @param data 계정 동기화 요청 데이터
   * @returns 동기화된 사용자 정보
   */
  async syncAccount(data: SyncAccountRequest): Promise<SyncAccountResponse> {
    // userId를 숫자로 변환 (문자열이면 parseInt)
    const userIdNumber = typeof data.userId === 'string' ? parseInt(data.userId, 10) : data.userId;
    
    // 이메일 기준으로 사용자 찾기
    let user = await prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (user) {
      // 사용자가 존재하면 업데이트
      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          email: data.email,
          name: data.name,
          provider: data.provider,
          userId: isNaN(userIdNumber) ? null : userIdNumber,
          clinicId: data.clinicId || null,
          unifiedToken: data.unifiedToken,
          updatedAt: new Date(),
        },
      });
    } else {
      // 사용자가 없으면 생성
      user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          provider: data.provider,
          userId: isNaN(userIdNumber) ? null : userIdNumber,
          clinicId: data.clinicId || null,
          unifiedToken: data.unifiedToken,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return {
      success: true,
      userId: user.userId?.toString() || '',
      message: '계정 동기화 완료',
    };
  },
};
