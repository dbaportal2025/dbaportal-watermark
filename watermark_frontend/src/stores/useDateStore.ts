import { create } from 'zustand';
import { Position, FontSettings } from '@/types';

interface DateStore {
  text: string;
  position: Position;
  font: FontSettings;
  scale: number;
  opacity: number;
  setText: (text: string) => void;
  setPosition: (position: Position) => void;
  setFont: (font: Partial<FontSettings>) => void;
  setScale: (scale: number) => void;
  setOpacity: (opacity: number) => void;
}

export const useDateStore = create<DateStore>((set) => ({
  text: '',
  // 위치를 비율(0~1)로 저장 - 이미지 크기에 비례하여 적용
  position: { x: 0.02, y: 0.06 },
  font: {
    family: 'Pretendard',
    size: 24,
    color: '#FFFFFF',
  },
  scale: 1,
  opacity: 1,

  setText: (text: string) => {
    set({ text });
  },

  setPosition: (position: Position) => {
    set({ position });
  },

  setFont: (font: Partial<FontSettings>) => {
    set((state) => ({
      font: { ...state.font, ...font },
    }));
  },

  setScale: (scale: number) => {
    set({ scale });
  },

  setOpacity: (opacity: number) => {
    set({ opacity });
  },
}));
