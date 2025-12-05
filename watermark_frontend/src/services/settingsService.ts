import api from '@/lib/api';

// 백엔드 Settings 모델과 일치하는 타입
export interface SettingsPreset {
  id: string;
  name: string;
  logoPositionX: number;
  logoPositionY: number;
  logoAnchor: string;
  logoScale: number;
  logoOpacity: number;
  datePositionX: number;
  datePositionY: number;
  dateFormat: string;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  dateScale: number;
  dateOpacity: number;
  createdAt?: string;
  updatedAt?: string;
}

// 프리셋 생성/수정 시 사용하는 타입
export type SettingsPresetInput = Omit<SettingsPreset, 'id' | 'createdAt' | 'updatedAt'>;

export const settingsService = {
  // 모든 프리셋 조회
  getAll: async () => {
    return api.get<SettingsPreset[]>('/api/settings/all');
  },

  // 기본 프리셋 조회
  getDefault: async () => {
    return api.get<SettingsPreset>('/api/settings');
  },

  // 특정 프리셋 조회
  getById: async (id: string) => {
    return api.get<SettingsPreset>(`/api/settings/${id}`);
  },

  // 새 프리셋 생성
  create: async (settings: SettingsPresetInput) => {
    return api.post<SettingsPreset>('/api/settings', settings);
  },

  // 프리셋 수정
  update: async (id: string, settings: Partial<SettingsPresetInput>) => {
    return api.put<SettingsPreset>(`/api/settings/${id}`, settings);
  },

  // 프리셋 삭제
  delete: async (id: string) => {
    return api.delete<void>(`/api/settings/${id}`);
  },
};

export default settingsService;
