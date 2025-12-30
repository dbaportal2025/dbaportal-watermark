const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// JSON 응답 파싱 헬퍼 (HTML 에러 페이지 처리)
async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    // HTML 에러 페이지를 받은 경우
    throw new Error(`서버 오류 (${response.status}): JSON 응답이 아닙니다`);
  }
}

// 백엔드 Logo 모델과 일치하는 타입
export interface ServerLogo {
  id: string;
  name: string;
  filename: string;
  url: string;
  width: number;
  height: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const logoService = {
  // 모든 로고 조회
  getAll: async (): Promise<ApiResponse<ServerLogo[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/logo/all`);
      return await parseJsonResponse<ApiResponse<ServerLogo[]>>(response);
    } catch (error) {
      console.error('Error fetching logos:', error);
      return { success: false, error: error instanceof Error ? error.message : '서버 연결 실패' };
    }
  },

  // 활성 로고 조회
  getActive: async (): Promise<ApiResponse<ServerLogo | null>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/logo`);
      return await parseJsonResponse<ApiResponse<ServerLogo | null>>(response);
    } catch (error) {
      console.error('Error fetching active logo:', error);
      return { success: false, error: error instanceof Error ? error.message : '서버 연결 실패' };
    }
  },

  // 로고 업로드
  upload: async (file: File, name?: string): Promise<ApiResponse<ServerLogo>> => {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      if (name) {
        formData.append('name', name);
      }

      const response = await fetch(`${API_BASE_URL}/api/logo/upload`, {
        method: 'POST',
        body: formData,
      });
      return await parseJsonResponse<ApiResponse<ServerLogo>>(response);
    } catch (error) {
      console.error('Error uploading logo:', error);
      return { success: false, error: error instanceof Error ? error.message : '로고 업로드 실패' };
    }
  },

  // 로고 활성화
  activate: async (id: string): Promise<ApiResponse<ServerLogo>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/logo/${id}/activate`, {
        method: 'PUT',
      });
      return await parseJsonResponse<ApiResponse<ServerLogo>>(response);
    } catch (error) {
      console.error('Error activating logo:', error);
      return { success: false, error: error instanceof Error ? error.message : '로고 활성화 실패' };
    }
  },

  // 로고 삭제
  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/logo/${id}`, {
        method: 'DELETE',
      });
      return await parseJsonResponse<ApiResponse<void>>(response);
    } catch (error) {
      console.error('Error deleting logo:', error);
      return { success: false, error: error instanceof Error ? error.message : '로고 삭제 실패' };
    }
  },

  // 로고 URL 생성 (상대 경로를 절대 경로로 변환)
  getLogoUrl: (logo: ServerLogo): string => {
    if (logo.url.startsWith('http')) {
      return logo.url;
    }
    return `${API_BASE_URL}${logo.url}`;
  },

  // 로고 파일 프록시 URL (S3 CORS 우회용)
  getLogoFileUrl: (logoId: string): string => {
    return `${API_BASE_URL}/api/logo/${logoId}/file`;
  },
};

export default logoService;
