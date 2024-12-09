import { useState, useEffect } from 'react';
import { useGameStore } from '../store';
import { GameImage } from './GameImage';
import { ImageModal } from './ImageModal';
import { socket } from '../socket';

export const GameBoard = () => {
  const { images, phase } = useGameStore(state => ({
    images: state.images,
    phase: state.phase
  }));
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isProcessingGuess, setIsProcessingGuess] = useState(false);

  // Listen for guess submissions
  useEffect(() => {
    const handleGuessStart = () => setIsProcessingGuess(true);
    const handleGuessEnd = () => setIsProcessingGuess(false);

    socket.on('guess-start', handleGuessStart);
    socket.on('guess-end', handleGuessEnd);

    return () => {
      socket.off('guess-start', handleGuessStart);
      socket.off('guess-end', handleGuessEnd);
    };
  }, []);

  const handleImageClick = (index: number) => {
    if (phase === 'playing' || phase === 'guessing') {
      setSelectedImageIndex(index);
    }
  };

  const handleNext = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % images.length);
    }
  };

  const handlePrevious = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-5 gap-4 max-w-7xl mx-auto">
        {images.map((image, index) => (
          <div 
            key={image.id} 
            className="aspect-[4/3] relative cursor-pointer"
            onClick={() => handleImageClick(index)}
          >
            <GameImage
              image={image}
              phase={phase}
              showTeam={phase === 'guessing' || phase === 'gameOver'}
              index={index}
              isGuessing={isProcessingGuess}
            />
          </div>
        ))}
      </div>

      {/* Helper text for processing guess */}
      {isProcessingGuess && (
        <div className="text-center mt-6 text-gray-300 animate-pulse">
          Finding the nearest matches for your codeword...
        </div>
      )}

      {selectedImageIndex !== null && (
        <ImageModal
          imageId={images[selectedImageIndex].id}
          imageUrl={images[selectedImageIndex].url}
          image={images[selectedImageIndex]}
          phase={phase}
          onClose={() => setSelectedImageIndex(null)}
          onNext={handleNext}
          onPrevious={handlePrevious}
          hasNext={selectedImageIndex < images.length - 1}
          hasPrevious={selectedImageIndex > 0}
        />
      )}
    </div>
  );
};