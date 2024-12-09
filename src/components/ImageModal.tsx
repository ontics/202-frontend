import { Dialog } from '@headlessui/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GameImage, GamePhase } from '../types';
import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store';

interface ImageModalProps {
  imageId: string;
  imageUrl: string;
  image: GameImage;
  phase: GamePhase;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  imageId,
  imageUrl,
  image,
  phase,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}) => {
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const addTag = useGameStore(state => state.addTag);
  const getPlayerById = useGameStore(state => state.getPlayerById);
  const roomId = useGameStore(state => state.roomId);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens for a new image
  useEffect(() => {
    const storedPlayerId = localStorage.getItem(`player-${roomId}`);
    if (storedPlayerId && phase === 'playing') {
      const userTag = image.tags.find(tag => tag.playerId === storedPlayerId);
      
      // Set initial state
      setDescription(userTag ? userTag.text : '');
      setIsEditing(!userTag);
      
      // Focus input if no description exists
      if (!userTag) {
        // Use a small delay to ensure the input is mounted
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 50);
      }
    }
  }, [imageId]); // Only run when image changes

  // Prevent room updates from affecting the input while editing
  useEffect(() => {
    const storedPlayerId = localStorage.getItem(`player-${roomId}`);
    if (storedPlayerId && phase === 'playing' && !isEditing) {
      const userTag = image.tags.find(tag => tag.playerId === storedPlayerId);
      if (userTag) {
        setDescription(userTag.text);
      }
    }
  }, [phase, image.tags, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      const storedPlayerId = localStorage.getItem(`player-${roomId}`);
      const currentPlayer = storedPlayerId ? getPlayerById(storedPlayerId) : null;
      
      if (currentPlayer) {
        addTag(imageId, description.trim(), currentPlayer.nickname);
        setIsEditing(false);
        
        if (hasNext) {
          onNext?.();
        } else {
          onClose();
        }
      }
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
    setIsEditing(true);
  };

  // Handle clicking on existing description
  const handleDescriptionClick = () => {
    setIsEditing(true);
    inputRef.current?.focus();
  };

  const getTeamBorderColor = () => {
    if (phase === 'guessing' || phase === 'gameOver') {
      if (image.team === 'green') return 'ring-4 ring-green-500';
      if (image.team === 'purple') return 'ring-4 ring-purple-500';
      if (image.team === 'red') return 'ring-4 ring-red-500';
    }
    return '';
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative bg-gray-800 rounded-lg max-w-4xl w-full">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/70 hover:text-white z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {hasPrevious && (
            <button
              onClick={onPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {hasNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          <div className={`relative aspect-video ${getTeamBorderColor()}`}>
            <img
              src={imageUrl}
              alt=""
              className={`w-full h-full object-contain ${image.matched ? 'opacity-75' : ''}`}
            />

            {/* Playing phase description form */}
            {phase === 'playing' && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={description}
                    onChange={handleDescriptionChange}
                    onClick={handleDescriptionClick}
                    placeholder="Enter a sentence description..."
                    className={`
                      flex-grow px-4 py-2 rounded-lg
                      ${isEditing ? 'bg-gray-700 text-white' : 'bg-gray-600 text-gray-300'}
                      ${!isEditing ? 'cursor-pointer' : ''}
                    `}
                  />
                  {isEditing && (
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Submit
                    </button>
                  )}
                </form>
              </div>
            )}

            {/* Match details overlay for guessing phase */}
            {phase === 'guessing' && image.matched && (
              <div className="absolute inset-0 bg-black/60 text-white p-8">
                <div className="max-w-2xl mx-auto space-y-4">
                  <h3 className="text-2xl font-bold">
                    Matched Word: {image.matchedWord}
                  </h3>
                  
                  <div className={`text-lg ${
                    image.similarity > 0.7 ? 'text-green-400' : 
                    image.similarity > 0.5 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    Match Score: {Math.round(image.similarity * 100)}%
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-300">Matching Description:</p>
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                      <p className="text-lg">{image.matchedTag ? image.matchedTag.text : image.defaultDescription}</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Written by: {image.matchedTag ? image.matchedTag.playerNickname : 'Gamemaster'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 