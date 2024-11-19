import React from 'react';
import { useGameStore } from '../store';
import { GameImage } from './GameImage';

export const GameBoard: React.FC = () => {
  const { images } = useGameStore();

  return (
    <div className="min-h-screen pb-[160px] pt-4">
      <div className="grid grid-cols-5 gap-4 w-full max-w-6xl mx-auto px-4">
        {images.map((image) => (
          <GameImage key={image.id} image={image} />
        ))}
      </div>
    </div>
  );
};