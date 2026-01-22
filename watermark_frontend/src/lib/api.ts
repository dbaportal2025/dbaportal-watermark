const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // API 키 추가
    if (API_KEY) {
      headers['x-api-key'] = API_KEY;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // HTML 에러 페이지를 받았을 경우 안전하게 처리
    const text = await response.text();
    let data: ApiResponse<T>;
    try {
      data = JSON.parse(text);
    } catch {
      return {
        success: false,
        error: `서버 오류 (${response.status}): JSON 응답이 아닙니다`,
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'API 요청 실패',
      };
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '네트워크 오류',
    };
  }
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'DELETE' }),

  // unifiedToken을 포함한 GET 요청
  getWithToken: <T>(endpoint: string, token: string) =>
    fetchApi<T>(endpoint, {
      method: 'GET',
      headers: {
        'x-unified-token': token,
      },
    }),
};

export default api;
