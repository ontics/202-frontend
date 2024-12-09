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
  const [isRevealingMatches, setIsRevealingMatches] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const loadingMessages = [
    "Finding the nearest matches for your codeword...",
    "Judging your descriptions...",
    "Double-checking my answers...",
    "Performing complex mathematics...",
    "Thanking you for sticking around...",
    "Praying something will happen soon...",
    "Wishing you the best of luck..."
  ];

  // Cycle through loading messages every 5 seconds
  useEffect(() => {
    if (isProcessingGuess && !isRevealingMatches) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isProcessingGuess, isRevealingMatches]);

  // Reset loading message index when processing starts
  useEffect(() => {
    if (isProcessingGuess) {
      setLoadingMessageIndex(0);
    }
  }, [isProcessingGuess]);

  // Listen for guess submissions and match reveals
  useEffect(() => {
    const handleGuessStart = () => {
      setIsProcessingGuess(true);
      setIsRevealingMatches(false);
    };

    const handleGuessEnd = () => {
      setIsProcessingGuess(false);
      setIsRevealingMatches(false);
    };

    const handleMatchReveal = () => {
      setIsProcessingGuess(false);
      setIsRevealingMatches(true);
    };

    socket.on('guess-start', handleGuessStart);
    socket.on('guess-end', handleGuessEnd);
    socket.on('match-reveal', handleMatchReveal);

    return () => {
      socket.off('guess-start', handleGuessStart);
      socket.off('guess-end', handleGuessEnd);
      socket.off('match-reveal', handleMatchReveal);
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
              isGuessing={isProcessingGuess && !isRevealingMatches}
            />
          </div>
        ))}
      </div>

      {/* Helper text for processing guess */}
      {isProcessingGuess && !isRevealingMatches && (
        <div className="text-center mt-6">
          <div 
            className="text-gray-300 transition-opacity duration-500"
            key={loadingMessageIndex} // Force re-render animation
          >
            {loadingMessages[loadingMessageIndex]}
          </div>
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

      <style>{`
        .text-gray-300 {
          animation: fadeInOut 4s ease-in-out;
        }

        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};