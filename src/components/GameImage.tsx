import React from 'react';
import { useGameStore } from '../store';
import type { GameImage as GameImageType } from '../types';
import { X } from 'lucide-react';

interface Props {
  image: GameImageType;
}

export const GameImage: React.FC<Props> = ({ image }) => {
  const { selectImage, removeTag, phase } = useGameStore();

  const borderColor = {
    green: 'border-green-500',
    purple: 'border-purple-500',
    red: 'border-red-500',
  }[image.team];

  const handleTagRemove = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    removeTag(image.id, tag);
  };

  return (
    <div
      className={`relative aspect-square cursor-pointer transition-all
        ${image.selected ? 'ring-4 ring-blue-500' : ''}
        ${borderColor} border-4 rounded-lg overflow-hidden group`}
      onClick={() => phase === 'tagging' && selectImage(image.id)}
    >
      <img
        src={image.url}
        alt="Game tile"
        className={`w-full h-full object-cover transition-all
          ${image.matched ? 'blur-sm brightness-50' : ''}`}
      />
      
      {/* Matched overlay */}
      {image.matched && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
          <span className="text-xl font-bold mb-2">{image.matchedWord}</span>
          <span className="text-sm opacity-75">{Math.round(image.similarity*100)}%</span>
        </div>
      )}

      {/* Tags overlay */}
      {image.tags.length > 0 && phase === 'tagging' && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 transition-opacity">
          <div className="flex flex-wrap gap-1">
            {image.tags.map((tag, i) => (
              <span
                key={i}
                className="text-xs bg-white/20 rounded-full px-2 py-0.5 text-white flex items-center gap-1 group-hover:bg-white/30 transition-colors"
                onClick={(e) => handleTagRemove(e, tag)}
              >
                {tag}
                <X className="w-3 h-3 hover:text-red-300" />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};