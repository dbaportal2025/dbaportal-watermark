'use client';

import { useImageStore } from '@/stores/useImageStore';
import { Button } from '@/components/ui/button';
import { X, Trash2, LayoutTemplate } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ImageList() {
  const { images, selectedImageId, selectImage, removeImage, clearImages } =
    useImageStore();

  if (images.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        업로드된 이미지가 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          이미지 목록 ({images.length}개)
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearImages}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          전체 삭제
        </Button>
      </div>

      {images.length > 1 && (
        <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          첫 번째 이미지가 템플릿입니다. 로고/촬영일자 위치가 모든 이미지에 비례 적용됩니다.
        </p>
      )}

      <div className="space-y-1">
        {images.map((image, index) => (
          <div
            key={image.id}
            onClick={() => selectImage(image.id)}
            className={cn(
              'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors',
              selectedImageId === image.id
                ? 'bg-primary/10 border border-primary/30'
                : 'hover:bg-muted',
              index === 0 && 'border border-dashed border-primary/50'
            )}
          >
            <div className="relative">
              <img
                src={image.url}
                alt={image.name}
                className="w-10 h-10 object-cover rounded"
              />
              {index === 0 && (
                <div className="absolute -top-1 -left-1 bg-primary rounded-full p-0.5">
                  <LayoutTemplate className="h-2.5 w-2.5 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-sm truncate">{image.name}</p>
                {index === 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded font-medium">
                    템플릿
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {image.width} x {image.height}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                removeImage(image.id);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
