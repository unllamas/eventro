'use client';

import { Plus } from 'lucide-react';
import { FileNostr } from '@/types/event';

interface ImageUploaderProps {
  imageUrl: FileNostr | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageUploader({ imageUrl, onImageUpload }: ImageUploaderProps) {
  return (
    <div className="relative overflow-hidden flex items-center justify-center w-full h-full max-h-[220px] aspect-square rounded-xl bg-card border-[1px] border-border cursor-pointer">
      {imageUrl && (
        <img
          src={imageUrl.url}
          alt={imageUrl.fileName}
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute text-center">
        <Plus className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Click to upload</p>
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={onImageUpload}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </div>
  );
}
