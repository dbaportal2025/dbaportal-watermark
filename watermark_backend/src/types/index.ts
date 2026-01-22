export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface FontSettings {
  family: string;
  size: number;
  color: string;
}

export interface AnnotationStyle {
  color: string;
  thickness: number;
  lineStyle: 'solid' | 'dashed';
  borderRadius: number;
}

export interface Annotation {
  type: 'box' | 'dashed-box' | 'arrow' | 'text';
  position: Position;
  size: Size;
  style: AnnotationStyle;
  text?: string;
  points?: number[];
}

export interface WatermarkSettings {
  logoId?: string;
  logoPosition: Position;
  logoScale: number;
  logoOpacity: number;
  dateText: string;
  datePosition: Position;
  fontSettings: FontSettings;
  annotations: Annotation[];
}

export interface OutputSettings {
  folder: string;
  filenamePrefix: string;
  format: 'jpg' | 'png';
  quality: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

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

export interface UserInfo {
  id: number;
  userId: number | null;
  email: string | null;
  name: string | null;
  provider: string | null;
  clinicId: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface UserInfoResponse {
  success: true;
  data: UserInfo;
}